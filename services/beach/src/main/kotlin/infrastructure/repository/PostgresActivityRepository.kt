package com.hackathon.summer.faf.infrastructure.repository
import com.hackathon.summer.faf.domain.model.Activity
import com.hackathon.summer.faf.domain.repository.ActivityRepository
import com.hackathon.summer.faf.infrastructure.database.table.ActivityBookingTable
import com.hackathon.summer.faf.infrastructure.database.table.ActivityTable
import org.jetbrains.exposed.sql.ResultRow
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.deleteWhere
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.update
import org.jetbrains.exposed.sql.transactions.transaction

class PostgresActivityRepository : ActivityRepository {

    private fun toActivity(row: ResultRow, bookedVisitors: MutableSet<String>): Activity {
        return Activity(
            id = row[ActivityTable.id],
            name = row[ActivityTable.name],
            description = row[ActivityTable.description],
            capacity = row[ActivityTable.capacity],
            tokenCost = row[ActivityTable.tokenCost],
            bookedVisitors = bookedVisitors
        )
    }

    private fun bookedVisitorsByActivityIds(
        activityIds: List<String>
    ): Map<String, MutableSet<String>> {
        if (activityIds.isEmpty()) {
            return emptyMap()
        }

        return ActivityBookingTable
            .select {
                ActivityBookingTable.activityId inList activityIds
            }
            .groupBy(
                keySelector = { it[ActivityBookingTable.activityId] },
                valueTransform = { it[ActivityBookingTable.visitorId] }
            )
            .mapValues { it.value.toMutableSet() }
    }

    override fun findAll(): List<Activity> {

        return transaction {

            val rows = ActivityTable.selectAll().toList()
            val bookingsByActivity = bookedVisitorsByActivityIds(
                rows.map { it[ActivityTable.id] }
            )

            rows.map {
                val activityId = it[ActivityTable.id]

                toActivity(
                    row = it,
                    bookedVisitors = bookingsByActivity[activityId] ?: mutableSetOf()
                )
            }
        }
    }

    override fun findById(id: String): Activity? {

        return transaction {

            val row = ActivityTable
                .select { ActivityTable.id eq id }
                .singleOrNull()
                ?: return@transaction null

            val bookedVisitors = bookedVisitorsByActivityIds(listOf(id))[id]
                ?: mutableSetOf()

            toActivity(row, bookedVisitors)
        }
    }

    override fun findByBookedVisitor(visitorId: String): Activity? {

        return transaction {

            val activityId = ActivityBookingTable
                .select {
                    ActivityBookingTable.visitorId eq visitorId
                }
                .limit(1)
                .map { it[ActivityBookingTable.activityId] }
                .singleOrNull()
                ?: return@transaction null

            val row = ActivityTable
                .select { ActivityTable.id eq activityId }
                .singleOrNull()
                ?: return@transaction null

            val bookedVisitors = bookedVisitorsByActivityIds(listOf(activityId))[activityId]
                ?: mutableSetOf()

            toActivity(row, bookedVisitors)
        }
    }

    override fun book(activityId: String, visitorId: String) {

        transaction {

            ActivityBookingTable.deleteWhere {
                ActivityBookingTable.visitorId eq visitorId
            }

            ActivityBookingTable.insert {
                it[ActivityBookingTable.activityId] = activityId
                it[ActivityBookingTable.visitorId] = visitorId
            }
        }
    }

    override fun cancel(activityId: String, visitorId: String) {

        transaction {

            ActivityBookingTable.deleteWhere {
                (ActivityBookingTable.activityId eq activityId) and
                    (ActivityBookingTable.visitorId eq visitorId)
            }
        }
    }

    override fun save(activity: Activity) {

        transaction {

            val exists =
                ActivityTable.select {
                    ActivityTable.id eq activity.id
                }.count() > 0

            if (exists) {

                ActivityTable.update({
                    ActivityTable.id eq activity.id
                }) {

                    it[name] = activity.name
                    it[description] = activity.description
                    it[capacity] = activity.capacity
                    it[tokenCost] = activity.tokenCost
                }

            } else {

                ActivityTable.insert {

                    it[id] = activity.id
                    it[name] = activity.name
                    it[description] = activity.description
                    it[capacity] = activity.capacity
                    it[tokenCost] = activity.tokenCost
                }
            }
        }
    }
}
