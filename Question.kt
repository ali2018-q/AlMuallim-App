package com.almualim.core.model

enum class Difficulty { EASY, EASY_MEDIUM, MEDIUM, MEDIUM_HARD, HARD, VERY_HARD }
enum class QuestionCategory { SCIENCE, GEOGRAPHY, HISTORY, SPORTS, LITERATURE, TECHNOLOGY, ARTS, GENERAL }

data class LocalizedText(val ar: String, val en: String)

data class Question(
    val id: String,
    val category: QuestionCategory,
    val difficulty: Difficulty,
    val prompt: LocalizedText,
    val options: List<LocalizedText>,
    val correctOptionIndex: Int,
    val sourceReference: String
) {
    init {
        require(id.isNotBlank())
        require(options.size == 4)
        require(correctOptionIndex in options.indices)
        require(sourceReference.isNotBlank())
    }
}
