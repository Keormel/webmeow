package com.hackathon.summer.faf.infrastructure.database.table

import org.jetbrains.exposed.sql.Table

object ActivityBookingTable : Table("activity_bookings") {

    val activityId = varchar("activity_id", 50)

    val visitorId = varchar("visitor_id", 50)

    override val primaryKey = PrimaryKey(activityId, visitorId)
}
