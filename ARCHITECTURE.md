# Architecture

## Components

- `app`: Android entry point, navigation host and app-level dependency wiring.
- `core:model`: domain entities and deterministic business rules.
- `core:common`: shared utilities and cross-feature primitives.
- `feature:*`: isolated UI/domain feature modules.
- `functions`: trusted server-side operations.
- `firebase`: Firestore security rules, indexes and emulator config.

## Data ownership

| Data | Read | Write |
|---|---|---|
| Player public profile | Public | Owner for editable fields; server for aggregates |
| Questions | Authenticated users | Admin publishing pipeline only |
| Stage attempts | Attempt owner | Cloud Functions only |
| Leaderboard | Public | Cloud Functions only |

## Score integrity

A trusted backend must first create a `stageSessions` record with the ordered question IDs, player UID, active status and expiry. Android submits the session ID, a unique attempt ID and answers in that exact server-issued order. The callable function:
1. Authenticates the caller.
2. Validates the active, unexpired server-issued session, attempt shape, unique question IDs and exact question order.
3. Loads authoritative question documents.
4. Calculates score using server-side answer keys and fixed positional points.
5. Uses a Firestore transaction to create the attempt and update player/leaderboard aggregates.
6. Marks the session completed and returns the persisted result.

The transaction and immutable attempt document prevent duplicate award on retry. Production deployment must also include App Check, rate limiting/abuse monitoring, emulator security tests, and admin-only question publishing.
