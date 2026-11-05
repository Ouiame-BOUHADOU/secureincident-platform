package com.secureincident.backend.dto;

public record AdminStatisticsResponse(
        long totalUsers,
        long employees,
        long technicians,
        long totalIncidents,
        long openIncidents,
        long inProgressIncidents,
        long resolvedIncidents,
        long closedIncidents
) {}