package com.hackathon.summer.faf.application.usecase

import com.hackathon.summer.faf.domain.repository.VisitorRepository

class CreditTokensUseCase(
    private val visitorRepository: VisitorRepository,
) {

    fun execute(visitorId: String, reservationId: String, amount: Int): String? {
        if (visitorId.isBlank()) {
            return "Missing visitor id"
        }

        if (reservationId.isBlank()) {
            return "Missing reservation id"
        }

        if (amount <= 0) {
            return "Amount must be positive"
        }

        visitorRepository.creditTokens(visitorId, reservationId, amount)
        return null
    }
}
