package com.hrtrainingportal.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NotificationDto {
    private Long id;
    private String title;
    private String message;
    private boolean read;
    private String link;
    private LocalDateTime createdAt;
}
