package com.hrtrainingportal.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AuditLogDto {
    private Long id;
    private Long requestId;
    private Long userId;
    private String userName;
    private String action;
    private String details;
    private String oldStatus;
    private String newStatus;
    private LocalDateTime timestamp;
}
