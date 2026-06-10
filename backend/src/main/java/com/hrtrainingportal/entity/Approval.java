package com.hrtrainingportal.entity;

import com.hrtrainingportal.enums.RequestStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "approvals")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Approval {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "training_request_id")
    private TrainingRequest trainingRequest;

    @ManyToOne(optional = false)
    @JoinColumn(name = "approver_id")
    private User approver;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestStatus status;

    @Column(length = 1000)
    private String reason;

    @Column(length = 2000)
    private String comments;

    @CreationTimestamp
    private LocalDateTime actionDate;
}
