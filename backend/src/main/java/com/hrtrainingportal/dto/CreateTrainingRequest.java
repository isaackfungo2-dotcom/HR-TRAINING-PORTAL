package com.hrtrainingportal.dto;

import lombok.*;

import java.time.LocalDate;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CreateTrainingRequest {
    private String title;
    private String description;
    private String objectives;
    private String trainingType;
    private LocalDate proposedStartDate;
    private LocalDate proposedEndDate;
    private String provider;
    private String institution;
    private BigDecimal estimatedCost;
    private String currency;
    private String justification;
    private String expectedBenefits;
}
