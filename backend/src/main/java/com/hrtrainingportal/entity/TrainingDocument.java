package com.hrtrainingportal.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "training_documents")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TrainingDocument {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "training_request_id")
    private TrainingRequest trainingRequest;

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private String filePath;

    private String fileType;
    private long fileSize;

    @CreationTimestamp
    private LocalDateTime uploadedAt;
}
