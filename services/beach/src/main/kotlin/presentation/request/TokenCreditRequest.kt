package com.hackathon.summer.faf.presentation.request

import kotlinx.serialization.Serializable

@Serializable
data class TokenCreditRequest(
    val reservation_id: String,
    val amount: Int,
)
