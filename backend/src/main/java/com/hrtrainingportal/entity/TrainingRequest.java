package com.hrtrainingportal.entity;

import com.hrtrainingportal.enums.RequestStatus;
import com.hrtrainingportal.enums.TrainingType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "training_requests")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TrainingRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "employee_id")
    private User employee;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    @Column(length = 2000)
    private String objectives;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TrainingType trainingType;

    @Column(nullable = false)
    private LocalDate proposedStartDate;

    @Column(nullable = false)
    private LocalDate proposedEndDate;

    private String provider;
    private String institution;

    @Column(precision = 15, scale = 2)
    private BigDecimal estimatedCost;

    @Builder.Default
    private String currency = "USD";

    @Column(length = 2000)
    private String justification;

    @Column(length = 2000)
    private String expectedBenefits;

    @OneToMany(mappedBy = "trainingRequest", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TrainingDocument> documents;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private RequestStatus status = RequestStatus.PENDING_SUPERVISOR;

    @ManyToOne
    @JoinColumn(name = "supervisor_id")
    private User supervisor;

    @ManyToOne
    @JoinColumn(name = "hr_approver_id")
    private User hrApprover;

    @OneToMany(mappedBy = "trainingRequest", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Approval> approvals;

    @OneToMany(mappedBy = "trainingRequest", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AuditLog> auditLogs;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    private String rejectionReason;
    private String rescheduleComment;
    private LocalDate rescheduledStartDate;
    private LocalDate rescheduledEndDate;
}
