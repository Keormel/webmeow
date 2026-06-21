package com.hackathon.summer.faf.infrastructure.database.table

import org.jetbrains.exposed.sql.Table

object TokenCreditTable : Table("token_credits") {

    val reservationId = varchar("reservation_id", 100)

    val visitorId = varchar("visitor_id", 50)

    val amount = integer("amount")

    override val primaryKey = PrimaryKey(reservationId)
}
