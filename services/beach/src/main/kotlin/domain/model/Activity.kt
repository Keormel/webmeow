package com.hackathon.summer.faf.domain.model

data class Activity(
    val id: String,
    val name: String,
    val description: String?,
    val capacity: Int,
    val tokenCost: Int = 2,
    val bookedVisitors: MutableSet<String> = mutableSetOf()
) {

    fun remaining(): Int {
        return capacity - bookedVisitors.size
    }

    fun isFull(): Boolean {
        return bookedVisitors.size >= capacity
    }
}