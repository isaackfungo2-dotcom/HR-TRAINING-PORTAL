package com.hrtrainingportal.controller;

import com.hrtrainingportal.dto.*;
import com.hrtrainingportal.service.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("metrics")
    public ResponseEntity<DashboardMetricsDto> metrics() {
        return ResponseEntity.ok(dashboardService.getMetrics());
    }

    @GetMapping("by-department")
    public ResponseEntity<List<Map<String, Object>>> byDepartment() {
        return ResponseEntity.ok(dashboardService.getRequestsByDepartment());
    }

    @GetMapping("monthly-trend")
    public ResponseEntity<List<Map<String, Object>>> monthlyTrend() {
        return ResponseEntity.ok(dashboardService.getMonthlyTrend());
    }

    @GetMapping("type-distribution")
    public ResponseEntity<List<Map<String, Object>>> typeDistribution() {
        return ResponseEntity.ok(dashboardService.getInCountryVsOutOfCountry());
    }

    @GetMapping("approval-rates")
    public ResponseEntity<List<Map<String, Object>>> approvalRates() {
        return ResponseEntity.ok(dashboardService.getApprovalRates());
    }
}
