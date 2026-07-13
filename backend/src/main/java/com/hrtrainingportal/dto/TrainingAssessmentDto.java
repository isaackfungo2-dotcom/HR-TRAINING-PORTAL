package com.hrtrainingportal.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class TrainingAssessmentDto {
    private Long id;
    private Long requestId;
    private String requestTitle;
    private Long employeeId;
    private String employeeName;
    private int level;
    private String status;
    private String employeeData;      // raw JSON string
    private String supervisorData;    // raw JSON string (Level 3 Part B)
    private String supervisorName;
    private LocalDateTime supervisorSubmittedAt;
    private String hrComments;
    private String reviewedByName;
    private LocalDateTime reviewedAt;
    private LocalDateTime submittedAt;
    private LocalDateTime createdAt;
}
