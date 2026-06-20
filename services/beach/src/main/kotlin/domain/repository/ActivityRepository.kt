package com.hackathon.summer.faf.domain.repository

import com.hackathon.summer.faf.domain.model.Activity

interface ActivityRepository {

    fun findAll(): List<Activity>

    fun findById(id: String): Activity?

    fun findByBookedVisitor(visitorId: String): Activity?

    fun book(activityId: String, visitorId: String)

    fun cancel(activityId: String, visitorId: String)

    fun save(activity: Activity)
}
