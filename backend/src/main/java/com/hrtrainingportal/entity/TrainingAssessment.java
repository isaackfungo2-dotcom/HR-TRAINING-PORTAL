package com.hrtrainingportal.entity;

import com.hrtrainingportal.enums.AssessmentStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "training_assessments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TrainingAssessment {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "training_request_id")
    private TrainingRequest trainingRequest;

    @ManyToOne(optional = false)
    @JoinColumn(name = "employee_id")
    private User employee;

    @Column(nullable = false)
    private int level; // 1, 2, or 3

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AssessmentStatus status;

    // Employee form data (all levels)
    @Column(columnDefinition = "TEXT")
    private String employeeData;

    private LocalDateTime submittedAt;

    // Level 3 Part B — supervisor evaluation
    @Column(columnDefinition = "TEXT")
    private String supervisorData;

    @ManyToOne
    @JoinColumn(name = "supervisor_submitted_by")
    private User supervisorSubmittedBy;

    private LocalDateTime supervisorSubmittedAt;

    // HR review
    @ManyToOne
    @JoinColumn(name = "hr_reviewer_id")
    private User reviewedBy;

    private LocalDateTime reviewedAt;

    @Column(length = 2000)
    private String hrComments;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
