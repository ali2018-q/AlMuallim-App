package com.almualim.core.model

data class StageQuestionAnswer(
    val questionId: String,
    val selectedOptionIndex: Int
)

data class StageAttempt(
    val attemptId: String,
    val playerUid: String,
    val answers: List<StageQuestionAnswer>
)

object StageScoring {
    val pointsByQuestion = listOf(100, 200, 300, 400, 500, 600, 700, 800, 900, 1000)
    const val QUESTION_COUNT = 10
    const val MAX_STAGE_POINTS = 5500

    fun score(correctness: List<Boolean>): Int {
        require(correctness.size == QUESTION_COUNT)
        return correctness.mapIndexed { index, correct ->
            if (correct) pointsByQuestion[index] else 0
        }.sum()
    }
}
