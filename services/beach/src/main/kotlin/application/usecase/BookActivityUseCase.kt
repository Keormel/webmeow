package com.hackathon.summer.faf.application.usecase

import com.hackathon.summer.faf.domain.repository.ActivityRepository
import domain.error.ActivityErrors
import domain.error.VisitorErrors


class BookActivityUseCase(
    private val activityRepository: ActivityRepository
) {

    fun execute(activityId: String, visitorId: String): String? {

        if (visitorId.isBlank()) {
            return VisitorErrors.VISITOR_MISSING_ID
        }

        val activity = activityRepository.findById(activityId)
            ?: return ActivityErrors.ACTIVITY_NOT_FOUND

        val currentActivity = activityRepository.findByBookedVisitor(visitorId)

        if (currentActivity?.id == activityId) {
            return null
        }

        if (activity.isFull()) {
            return ActivityErrors.ACTIVITY_FULL
        }

        activityRepository.book(activityId, visitorId)

        return null
    }
}
