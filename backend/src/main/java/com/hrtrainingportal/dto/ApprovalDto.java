package com.hrtrainingportal.dto;

import com.hrtrainingportal.enums.RequestStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ApprovalDto {
    private Long id;
    private Long requestId;
    private Long approverId;
    private String approverName;
    private RequestStatus status;
    private String reason;
    private String comments;
    private LocalDateTime actionDate;
}
