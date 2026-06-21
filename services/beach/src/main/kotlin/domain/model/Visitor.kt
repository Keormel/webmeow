package com.hackathon.summer.faf.domain.model

data class Visitor(
    val id: String,
    val checkedIn: Boolean,
    val tokenBalance: Int = 0,
)
