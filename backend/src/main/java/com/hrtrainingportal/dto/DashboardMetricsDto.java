package com.hrtrainingportal.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DashboardMetricsDto {
    private long totalRequestsThisMonth;
    private long totalRequestsThisYear;
    private long pendingSupervisor;
    private long pendingHr;
    private long approvedInCountry;
    private long approvedOutOfCountry;
    private long rejected;
    private long upcoming30Days;
    private long upcoming60Days;
    private BigDecimal totalEstimatedCostThisMonth;
    private String currency;
}
