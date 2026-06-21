package com.hackathon.summer.faf.plugins

import com.hackathon.summer.faf.application.usecase.BookActivityUseCase
import com.hackathon.summer.faf.application.usecase.CancelActivityUseCase
import com.hackathon.summer.faf.application.usecase.CreditTokensUseCase
import com.hackathon.summer.faf.infrastructure.repository.PostgresActivityRepository
import com.hackathon.summer.faf.infrastructure.repository.PostgresVisitorRepository
import com.hackathon.summer.faf.presentation.controller.ActivityController
import com.hackathon.summer.faf.presentation.routing.activityRoutes
import io.ktor.server.application.*
import io.ktor.server.routing.*

fun Application.configureRouting() {
    val activityRepository = PostgresActivityRepository()
    val visitorRepository = PostgresVisitorRepository()

    val bookUseCase = BookActivityUseCase(activityRepository, visitorRepository)
    val cancelUseCase = CancelActivityUseCase(activityRepository, visitorRepository)
    val creditUseCase = CreditTokensUseCase(visitorRepository)

    val hotelServiceToken = environment.config
        .propertyOrNull("beach.hotelServiceToken")
        ?.getString()
        ?: System.getenv("HOTEL_TOKEN")
        ?: ""

    val controller = ActivityController(
        activityRepository,
        visitorRepository,
        bookUseCase,
        cancelUseCase,
        creditUseCase,
        hotelServiceToken,
    )

    routing {
        activityRoutes(controller)
    }
}
