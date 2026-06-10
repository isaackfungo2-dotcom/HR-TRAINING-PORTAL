package com.hrtrainingportal.dto;

import lombok.*;

import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ApprovalAction {
    private String action; // APPROVE, REJECT, RESCHEDULE
    private String reason;
    private String comments;
    private LocalDate newStartDate;
    private LocalDate newEndDate;
    private String newProvider;
}
