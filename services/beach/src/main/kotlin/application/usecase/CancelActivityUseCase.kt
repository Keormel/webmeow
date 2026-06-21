package com.hackathon.summer.faf.application.usecase

import com.hackathon.summer.faf.domain.repository.ActivityRepository
import com.hackathon.summer.faf.domain.repository.VisitorRepository
import domain.error.ActivityErrors
import domain.error.VisitorErrors

class CancelActivityUseCase(
    private val activityRepository: ActivityRepository,
    private val visitorRepository: VisitorRepository,
) {

    fun execute(activityId: String, visitorId: String): String? {
        val activity = activityRepository.findById(activityId)
            ?: return ActivityErrors.ACTIVITY_NOT_FOUND

        if (visitorId.isBlank()) {
            return VisitorErrors.VISITOR_MISSING_ID
        }

        if (!activity.bookedVisitors.contains(visitorId)) {
            return ActivityErrors.ACTIVITY_NOT_BOOKED
        }

        activityRepository.cancel(activityId, visitorId)
        visitorRepository.addTokens(visitorId, activity.tokenCost)

        return null
    }
}
