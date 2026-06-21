package com.hackathon.summer.faf.presentation.controller

import com.hackathon.summer.faf.application.usecase.BookActivityUseCase
import com.hackathon.summer.faf.application.usecase.CancelActivityUseCase
import com.hackathon.summer.faf.application.usecase.CreditTokensUseCase
import com.hackathon.summer.faf.domain.repository.ActivityRepository
import com.hackathon.summer.faf.domain.repository.VisitorRepository
import com.hackathon.summer.faf.presentation.auth.requireGuestMatch
import com.hackathon.summer.faf.presentation.auth.requireServiceToken
import com.hackathon.summer.faf.presentation.request.TokenCreditRequest
import com.hackathon.summer.faf.presentation.request.VisitorRequest
import com.hackathon.summer.faf.presentation.response.ActivityResponse
import com.hackathon.summer.faf.presentation.response.ErrorResponse
import domain.error.ActivityErrors
import domain.error.VisitorErrors
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*

class ActivityController(
    private val activityRepository: ActivityRepository,
    private val visitorRepository: VisitorRepository,
    private val bookActivityUseCase: BookActivityUseCase,
    private val cancelActivityUseCase: CancelActivityUseCase,
    private val creditTokensUseCase: CreditTokensUseCase,
    private val hotelServiceToken: String,
) {

    private suspend fun respondError(call: ApplicationCall, error: String) {
        val status = when (error) {
            ActivityErrors.ACTIVITY_NOT_FOUND,
            VisitorErrors.VISITOR_NOT_FOUND -> HttpStatusCode.NotFound

            ActivityErrors.ACTIVITY_FULL,
            ActivityErrors.ACTIVITY_ALREADY_BOOKED,
            ActivityErrors.ACTIVITY_NOT_BOOKED,
            VisitorErrors.VISITOR_ALREADY_BOOKED_OTHER_ACTIVITY -> HttpStatusCode.Conflict

            VisitorErrors.VISITOR_NOT_CHECKED_IN -> HttpStatusCode.Forbidden
            VisitorErrors.VISITOR_INSUFFICIENT_TOKENS -> HttpStatusCode.PaymentRequired

            else -> HttpStatusCode.BadRequest
        }

        call.respond(status, ErrorResponse(error))
    }

    suspend fun book(call: ApplicationCall) {
        val activityId = call.parameters["activity_id"]

        if (activityId.isNullOrBlank()) {
            respondError(call, ActivityErrors.MISSING_ACTIVITY_ID)
            return
        }

        val request = call.receive<VisitorRequest>()
        if (!call.requireGuestMatch(request.id)) {
            return
        }

        val error = bookActivityUseCase.execute(
            activityId = activityId,
            visitorId = request.id,
        )

        if (error != null) {
            respondError(call, error)
            return
        }

        call.respond(
            HttpStatusCode.OK,
            mapOf("status" to "booked"),
        )
    }

    suspend fun cancel(call: ApplicationCall) {
        val activityId = call.parameters["activity_id"]

        if (activityId.isNullOrBlank()) {
            respondError(call, ActivityErrors.MISSING_ACTIVITY_ID)
            return
        }

        val request = call.receive<VisitorRequest>()
        if (!call.requireGuestMatch(request.id)) {
            return
        }

        val error = cancelActivityUseCase.execute(
            activityId = activityId,
            visitorId = request.id,
        )

        if (error != null) {
            respondError(call, error)
            return
        }

        call.respond(
            HttpStatusCode.OK,
            mapOf("status" to "cancelled"),
        )
    }

    suspend fun getActivityByGuest(call: ApplicationCall) {
        val visitorId = call.parameters["visitor_id"]

        if (visitorId.isNullOrBlank()) {
            respondError(call, VisitorErrors.VISITOR_MISSING_ID)
            return
        }

        if (!call.requireGuestMatch(visitorId)) {
            return
        }

        val activity = activityRepository.findByBookedVisitor(visitorId)

        call.respond(
            HttpStatusCode.OK,
            mapOf("activity_id" to activity?.id),
        )
    }

    suspend fun getActivity(call: ApplicationCall) {
        val activityId = call.parameters["activity_id"]

        if (activityId.isNullOrBlank()) {
            respondError(call, ActivityErrors.MISSING_ACTIVITY_ID)
            return
        }

        val activity = activityRepository.findById(activityId)

        if (activity == null) {
            respondError(call, ActivityErrors.ACTIVITY_NOT_FOUND)
            return
        }

        call.respond(
            HttpStatusCode.OK,
            ActivityResponse(
                activity_id = activity.id,
                activity_name = activity.name,
                description = activity.description,
                capacity = activity.capacity,
                remaining = activity.remaining(),
            ),
        )
    }

    suspend fun getActivities(call: ApplicationCall) {
        val activities = activityRepository.findAll()

        val response = activities.map { activity ->
            ActivityResponse(
                activity_id = activity.id,
                activity_name = activity.name,
                description = activity.description,
                capacity = activity.capacity,
                remaining = activity.remaining(),
            )
        }

        call.respond(
            HttpStatusCode.OK,
            mapOf("activities" to response),
        )
    }

    suspend fun creditTokens(call: ApplicationCall) {
        if (!call.requireServiceToken(hotelServiceToken)) {
            return
        }

        val visitorId = call.parameters["visitor_id"]
        if (visitorId.isNullOrBlank()) {
            respondError(call, VisitorErrors.VISITOR_MISSING_ID)
            return
        }

        val request = call.receive<TokenCreditRequest>()
        val error = creditTokensUseCase.execute(
            visitorId = visitorId,
            reservationId = request.reservation_id,
            amount = request.amount,
        )

        if (error != null) {
            respondError(call, error)
            return
        }

        call.respond(
            HttpStatusCode.OK,
            mapOf("status" to "credited"),
        )
    }

    suspend fun checkInVisitor(call: ApplicationCall) {
        val request = call.receive<VisitorRequest>()

        if (request.id.isBlank()) {
            respondError(call, VisitorErrors.VISITOR_MISSING_ID)
            return
        }

        visitorRepository.checkIn(request.id)
        call.respond(HttpStatusCode.OK, mapOf("status" to "checked_in"))
    }

    suspend fun checkOutVisitor(call: ApplicationCall) {
        val request = call.receive<VisitorRequest>()

        if (request.id.isBlank()) {
            respondError(call, VisitorErrors.VISITOR_MISSING_ID)
            return
        }

        visitorRepository.checkOut(request.id)
        call.respond(HttpStatusCode.OK, mapOf("status" to "checked_out"))
    }
}
