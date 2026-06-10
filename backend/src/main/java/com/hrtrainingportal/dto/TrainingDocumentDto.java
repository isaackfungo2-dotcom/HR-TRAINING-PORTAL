package com.hrtrainingportal.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TrainingDocumentDto {
    private Long id;
    private String fileName;
    private String fileType;
    private long fileSize;
    private String downloadUrl;
    private LocalDateTime uploadedAt;
}
