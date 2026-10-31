import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { onCall, HttpsError } from "firebase-functions/v2/https";

initializeApp();
const db = getFirestore();

const POINTS = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000] as const;

type SubmittedAnswer = { questionId: string; selectedOptionIndex: number };

export const completeStage = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Authentication required.");
  }

  const uid = request.auth.uid;
  const attemptId = String(request.data?.attemptId ?? "");
  const sessionId = String(request.data?.sessionId ?? "");
  const answers = request.data?.answers as SubmittedAnswer[] | undefined;

  if (!/^[A-Za-z0-9_-]{16,80}$/.test(attemptId) || !/^[A-Za-z0-9_-]{16,80}$/.test(sessionId)) {
    throw new HttpsError("invalid-argument", "Invalid attempt or session id.");
  }
  if (!Array.isArray(answers) || answers.length !== 10) {
    throw new HttpsError("invalid-argument", "A stage must contain 10 answers.");
  }

  const attemptRef = db.collection("stageAttempts").doc(attemptId);
  const sessionRef = db.collection("stageSessions").doc(sessionId);
  const playerRef = db.collection("players").doc(uid);
  const leaderboardRef = db.collection("leaderboard").doc(uid);

  return db.runTransaction(async (tx) => {
    const existing = await tx.get(attemptRef);
    if (existing.exists) {
      if (existing.data()?.playerUid !== uid) {
        throw new HttpsError("already-exists", "Attempt id is already used.");
      }
      return existing.data()?.result;
    }

    const sessionSnap = await tx.get(sessionRef);
    const session = sessionSnap.data();
    if (!sessionSnap.exists || session?.playerUid !== uid || session?.status !== "active" ||
        !Array.isArray(session?.questionIds) || session.questionIds.length !== 10) {
      throw new HttpsError("failed-precondition", "A valid active server-issued stage session is required.");
    }
    if (session.expiresAt && session.expiresAt.toMillis() < Date.now()) {
      throw new HttpsError("deadline-exceeded", "Stage session has expired.");
    }

    const uniqueIds = new Set<string>();
    for (const answer of answers) {
      if (!answer || typeof answer.questionId !== "string" ||
          !Number.isInteger(answer.selectedOptionIndex) ||
          answer.selectedOptionIndex < 0 || answer.selectedOptionIndex > 3 ||
          uniqueIds.has(answer.questionId)) {
        throw new HttpsError("invalid-argument", "Invalid or duplicate answer.");
      }
      uniqueIds.add(answer.questionId);
    }
    const submittedOrder = answers.map((answer) => answer.questionId);
    if (submittedOrder.some((id, index) => id !== session.questionIds[index])) {
      throw new HttpsError("invalid-argument", "Answers must match the server-issued question order.");
    }

    const questionRefs = [...uniqueIds].map((id) => db.collection("questionPublic").doc(id));
    const questionDocs = await Promise.all(questionRefs.map((ref) => tx.get(ref)));
    if (questionDocs.some((doc) => !doc.exists)) {
      throw new HttpsError("failed-precondition", "Question set is unavailable.");
    }

    const publicQuestionMap = new Map(questionDocs.map((doc) => [doc.id, doc.data()!]));
    const keyRefs = [...uniqueIds].map((id) => db.collection("questionKeys").doc(id));
    const keyDocs = await Promise.all(keyRefs.map((ref) => tx.get(ref)));
    if (keyDocs.some((doc) => !doc.exists)) {
      throw new HttpsError("failed-precondition", "Question answer key is unavailable.");
    }
    const keyMap = new Map(keyDocs.map((doc) => [doc.id, doc.data()!]));

    let score = 0;
    let correct = 0;
    answers.forEach((answer, index) => {
      const question = publicQuestionMap.get(answer.questionId)!;
      const key = keyMap.get(answer.questionId)!;
      if (question.status !== "published" ||
          !Number.isInteger(key.correctOptionIndex) ||
          key.correctOptionIndex < 0 || key.correctOptionIndex > 3) {
        throw new HttpsError("failed-precondition", "Question is not publishable.");
      }
      if (answer.selectedOptionIndex === key.correctOptionIndex) {
        score += POINTS[index];
        correct += 1;
      }
    });

    const playerSnap = await tx.get(playerRef);
    if (!playerSnap.exists) {
      throw new HttpsError("failed-precondition", "Player profile not found.");
    }
    const player = playerSnap.data()!;
    const previousPoints = Number(player.totalPoints ?? 0);
    const previousStages = Number(player.completedStages ?? 0);
    const wrong = 10 - correct;
    const result = { score, correctAnswers: correct, wrongAnswers: wrong };

    tx.create(attemptRef, {
      playerUid: uid,
      sessionId,
      answers,
      result,
      createdAt: FieldValue.serverTimestamp()
    });
    tx.update(sessionRef, { status: "completed", completedAt: FieldValue.serverTimestamp() });
    tx.set(playerRef, {
      totalPoints: previousPoints + score,
      completedStages: previousStages + 1,
      correctAnswers: Number(player.correctAnswers ?? 0) + correct,
      wrongAnswers: Number(player.wrongAnswers ?? 0) + wrong,
      updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });
    tx.set(leaderboardRef, {
      displayName: player.displayName ?? "Player",
      countryCode: player.countryCode ?? "UN",
      totalPoints: previousPoints + score,
      completedStages: previousStages + 1,
      updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });

    return result;
  });
});
