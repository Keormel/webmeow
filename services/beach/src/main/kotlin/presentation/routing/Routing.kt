package com.hackathon.summer.faf.presentation.routing

import com.hackathon.summer.faf.presentation.controller.ActivityController
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Route.activityRoutes(
    controller: ActivityController
) {
    get("/health") {
        call.respond(
            HttpStatusCode.OK,
            mapOf("status" to "ok")
        )
    }

    get("/") {
        call.respond(
            HttpStatusCode.OK,
            "Hello"
        )
    }
    route("/activity") {

        post("/book/{activity_id}") {
            controller.book(call)
        }

        post("/cancel/{activity_id}") {
            controller.cancel(call)
        }

        get("/by-guest/{visitor_id}") {
            controller.getActivityByGuest(call)
        }

        get("/{activity_id}") {
            controller.getActivity(call)
        }
    }

    get("/activities") {
        controller.getActivities(call)
    }

    route("/visitor") {
        post("/check-in") {
            controller.checkInVisitor(call)
        }

        post("/check-out") {
            controller.checkOutVisitor(call)
        }
    }
}
