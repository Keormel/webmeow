package com.hackathon.summer.faf.application.usecase

import com.hackathon.summer.faf.domain.repository.ActivityRepository
import com.hackathon.summer.faf.domain.repository.VisitorRepository
import domain.error.ActivityErrors
import domain.error.VisitorErrors


class BookActivityUseCase(
    private val activityRepository: ActivityRepository,
    private val visitorRepository: VisitorRepository
) {

    fun execute(activityId: String, visitorId: String): String? {

        if (visitorId.isBlank()) {
            return VisitorErrors.VISITOR_MISSING_ID
        }

        val activity = activityRepository.findById(activityId)
            ?: return ActivityErrors.ACTIVITY_NOT_FOUND

        val visitor = visitorRepository.findById(visitorId)
            ?: return VisitorErrors.VISITOR_NOT_FOUND

        if (!visitor.checkedIn) {
            return VisitorErrors.VISITOR_NOT_CHECKED_IN
        }

        val currentActivity = activityRepository.findByBookedVisitor(visitorId)

        if (currentActivity != null) {
            if (currentActivity.id == activityId) {
                return ActivityErrors.ACTIVITY_ALREADY_BOOKED
            }

            return VisitorErrors.VISITOR_ALREADY_BOOKED_OTHER_ACTIVITY
        }

        if (activity.isFull()) {
            return ActivityErrors.ACTIVITY_FULL
        }

        activityRepository.book(activityId, visitorId)

        return null
    }
}
