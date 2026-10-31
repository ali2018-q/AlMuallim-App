package com.almualim.core.model

import org.junit.Assert.assertEquals
import org.junit.Test

class StageScoringTest {
    @Test fun perfectStageTotals5500() {
        assertEquals(5500, StageScoring.score(List(10) { true }))
    }

    @Test fun noCorrectAnswersScoreZero() {
        assertEquals(0, StageScoring.score(List(10) { false }))
    }

    @Test fun scoringUsesQuestionPosition() {
        val answers = List(10) { it == 0 || it == 9 }
        assertEquals(1100, StageScoring.score(answers))
    }
}
