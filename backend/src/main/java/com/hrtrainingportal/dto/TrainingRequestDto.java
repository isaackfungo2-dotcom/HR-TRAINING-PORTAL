package com.hrtrainingportal.dto;

import com.hrtrainingportal.enums.RequestStatus;
import com.hrtrainingportal.enums.TrainingType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TrainingRequestDto {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String departmentName;
    private String supervisorName;
    private String title;
    private String description;
    private String objectives;
    private TrainingType trainingType;
    private LocalDate proposedStartDate;
    private LocalDate proposedEndDate;
    private String provider;
    private String institution;
    private BigDecimal estimatedCost;
    private String currency;
    private String justification;
    private String expectedBenefits;
    private RequestStatus status;
    private Long supervisorId;
    private Long hrApproverId;
    private String hrApproverName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<TrainingDocumentDto> documents;
    private String rejectionReason;
    private String rescheduleComment;
    private LocalDate rescheduledStartDate;
    private LocalDate rescheduledEndDate;
}
