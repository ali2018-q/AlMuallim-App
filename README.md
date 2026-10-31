# Firebase integration

The repository contains initial Firestore rules, indexes, emulator ports, and a trusted Cloud Function example.

The Android Firebase SDK dependencies are declared, but Firebase runtime initialization and the Google Services Gradle plugin are intentionally deferred until the Firebase project is created and its Android configuration is supplied.

Before enabling production:
1. Create a Firebase project.
2. Register `com.almualim.app`.
3. Add `google-services.json` locally under `app/` (do not commit credentials/config unless the maintainer explicitly chooses that policy).
4. Enable Authentication and Firestore.
5. Deploy and test the rules and callable functions with Firebase Emulator Suite.
6. Enable App Check and configure abuse monitoring.

Firestore rules deny client access to answer keys. `questionPublic` contains prompt/options only; `questionKeys` contains the correct option index and is server-only.
