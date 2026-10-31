# Firestore data model (initial proposal)

## `players/{uid}`
Editable: `displayName`, `age`, `countryCode`, `createdAt`.
Server-owned aggregates: `totalPoints`, `completedStages`, `correctAnswers`, `wrongAnswers`, `updatedAt`.

## `questionPublic/{questionId}`
`status`, `category`, `difficulty`, `prompt.ar`, `prompt.en`, `options[]`, `sourceReference`, `reviewedAt`. Readable to authenticated players.

`questionKeys/{questionId}`
`correctOptionIndex`. Server-only; clients cannot read or write. The callable function reads both collections and grades answers on the server.

## `stageAttempts/{attemptId}`
`playerUid`, `answers[]`, `result`, `createdAt`. Client writes denied.

## `leaderboard/{uid}`
Public projection: `displayName`, `countryCode`, `totalPoints`, `completedStages`, `updatedAt`. Client writes denied.

## Question constraints
Exactly four options; correct option index 0..3; stable unique ID; Arabic and English prompt/options; reviewed source; non-religious category and content; publication status.
