package com.almualim.core.model

data class PlayerProfile(
    val uid: String,
    val displayName: String,
    val age: Int?,
    val countryCode: String,
    val totalPoints: Long,
    val completedStages: Int,
    val correctAnswers: Long,
    val wrongAnswers: Long
)
