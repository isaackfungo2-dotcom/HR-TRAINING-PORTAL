package com.hrtrainingportal.entity;

import com.hrtrainingportal.enums.RequestStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "training_request_id")
    private TrainingRequest trainingRequest;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private String action;

    @Column(length = 2000)
    private String details;

    @Enumerated(EnumType.STRING)
    private RequestStatus oldStatus;

    @Enumerated(EnumType.STRING)
    private RequestStatus newStatus;

    @CreationTimestamp
    private LocalDateTime timestamp;
}
