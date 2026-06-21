package com.hackathon.summer.faf.presentation.auth

import io.ktor.http.HttpStatusCode
import io.ktor.server.application.ApplicationCall
import io.ktor.server.response.respond
import com.hackathon.summer.faf.presentation.response.ErrorResponse

fun ApplicationCall.requireGuestMatch(expectedGuestId: String): Boolean {
    val headerGuestId = request.headers["X-Guest-Id"]
    if (headerGuestId.isNullOrBlank() || headerGuestId != expectedGuestId) {
        respond(HttpStatusCode.Forbidden, ErrorResponse("Not authorized for this guest"))
        return false
    }
    return true
}

fun ApplicationCall.requireServiceToken(expectedToken: String): Boolean {
    if (expectedToken.isBlank()) {
        respond(HttpStatusCode.ServiceUnavailable, ErrorResponse("Service token not configured"))
        return false
    }

    val token = request.headers["X-Service-Token"]
    if (token != expectedToken) {
        respond(HttpStatusCode.Unauthorized, ErrorResponse("Unauthorized"))
        return false
    }

    return true
}
