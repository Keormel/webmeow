package com.hackathon.summer.faf.domain.repository

import com.hackathon.summer.faf.domain.model.Visitor

interface VisitorRepository {

    fun findById(id: String): Visitor?

    fun checkIn(id: String)

    fun checkOut(id: String)

    fun creditTokens(visitorId: String, reservationId: String, amount: Int): Boolean

    fun deductTokens(visitorId: String, amount: Int): Boolean

    fun addTokens(visitorId: String, amount: Int)
}
