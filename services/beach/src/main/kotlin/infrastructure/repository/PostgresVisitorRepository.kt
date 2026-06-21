package com.hackathon.summer.faf.infrastructure.repository

import com.hackathon.summer.faf.domain.model.Visitor
import com.hackathon.summer.faf.domain.repository.VisitorRepository
import com.hackathon.summer.faf.infrastructure.database.table.ActivityBookingTable
import com.hackathon.summer.faf.infrastructure.database.table.TokenCreditTable
import com.hackathon.summer.faf.infrastructure.database.table.VisitorsTable
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.deleteWhere
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.update

class PostgresVisitorRepository : VisitorRepository {

    override fun findById(id: String): Visitor? {
        return transaction {
            VisitorsTable
                .select {
                    VisitorsTable.id eq id
                }
                .map {
                    Visitor(
                        id = it[VisitorsTable.id],
                        checkedIn = it[VisitorsTable.checkedIn],
                        tokenBalance = it[VisitorsTable.tokenBalance],
                    )
                }
                .singleOrNull()
        }
    }

    override fun checkIn(id: String) {
        transaction {
            val exists = VisitorsTable
                .select { VisitorsTable.id eq id }
                .count() > 0

            if (exists) {
                VisitorsTable.update({ VisitorsTable.id eq id }) {
                    it[checkedIn] = true
                }
            } else {
                VisitorsTable.insert {
                    it[VisitorsTable.id] = id
                    it[checkedIn] = true
                }
            }
        }
    }

    override fun checkOut(id: String) {
        transaction {
            ActivityBookingTable.deleteWhere {
                ActivityBookingTable.visitorId eq id
            }

            VisitorsTable.update({ VisitorsTable.id eq id }) {
                it[checkedIn] = false
            }
        }
    }

    override fun creditTokens(
        visitorId: String,
        reservationId: String,
        amount: Int,
    ): Boolean {
        if (amount <= 0) {
            return false
        }

        return transaction {
            val alreadyCredited = TokenCreditTable
                .select { TokenCreditTable.reservationId eq reservationId }
                .count() > 0

            if (alreadyCredited) {
                return@transaction true
            }

            val existing = VisitorsTable
                .select { VisitorsTable.id eq visitorId }
                .singleOrNull()

            if (existing == null) {
                VisitorsTable.insert {
                    it[id] = visitorId
                    it[checkedIn] = true
                    it[tokenBalance] = amount
                }
            } else {
                VisitorsTable.update({ VisitorsTable.id eq visitorId }) {
                    it[checkedIn] = true
                    it[tokenBalance] = existing[VisitorsTable.tokenBalance] + amount
                }
            }

            TokenCreditTable.insert {
                it[TokenCreditTable.reservationId] = reservationId
                it[TokenCreditTable.visitorId] = visitorId
                it[TokenCreditTable.amount] = amount
            }

            true
        }
    }

    override fun deductTokens(visitorId: String, amount: Int): Boolean {
        if (amount <= 0) {
            return true
        }

        return transaction {
            val row = VisitorsTable
                .select { VisitorsTable.id eq visitorId }
                .singleOrNull()
                ?: return@transaction false

            val balance = row[VisitorsTable.tokenBalance]
            if (balance < amount) {
                return@transaction false
            }

            VisitorsTable.update({ VisitorsTable.id eq visitorId }) {
                it[tokenBalance] = balance - amount
            }

            true
        }
    }

    override fun addTokens(visitorId: String, amount: Int) {
        if (amount <= 0) {
            return
        }

        transaction {
            val existing = VisitorsTable
                .select { VisitorsTable.id eq visitorId }
                .singleOrNull()

            if (existing == null) {
                VisitorsTable.insert {
                    it[id] = visitorId
                    it[checkedIn] = true
                    it[tokenBalance] = amount
                }
            } else {
                VisitorsTable.update({ VisitorsTable.id eq visitorId }) {
                    it[tokenBalance] = existing[VisitorsTable.tokenBalance] + amount
                }
            }
        }
    }
}
