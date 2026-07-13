package com.hrtrainingportal.service;

import com.hrtrainingportal.dto.TrainingAssessmentDto;
import com.hrtrainingportal.entity.TrainingAssessment;
import com.hrtrainingportal.entity.TrainingRequest;
import com.hrtrainingportal.entity.User;
import com.hrtrainingportal.enums.AssessmentStatus;
import com.hrtrainingportal.exception.BadRequestException;
import com.hrtrainingportal.exception.ResourceNotFoundException;
import com.hrtrainingportal.repository.AssessmentRepository;
import com.hrtrainingportal.repository.TrainingRequestRepository;
import com.hrtrainingportal.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AssessmentService {

    private final AssessmentRepository assessmentRepo;
    private final TrainingRequestRepository requestRepo;
    private final UserRepository userRepo;

    public AssessmentService(AssessmentRepository assessmentRepo,
                             TrainingRequestRepository requestRepo,
                             UserRepository userRepo) {
        this.assessmentRepo = assessmentRepo;
        this.requestRepo = requestRepo;
        this.userRepo = userRepo;
    }

    public List<TrainingAssessmentDto> getAssessmentsForRequest(Long requestId) {
        return assessmentRepo.findByTrainingRequestId(requestId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public TrainingAssessmentDto submitEmployeeAssessment(String email, Long requestId, int level, String formData) {
        User employee = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        TrainingRequest request = requestRepo.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Training request not found"));

        // Enforce level progression: level 2 requires level 1 submitted, level 3 requires level 2 submitted
        if (level > 1) {
            TrainingAssessment prev = assessmentRepo
                    .findByTrainingRequestIdAndLevel(requestId, level - 1)
                    .orElseThrow(() -> new BadRequestException("Level " + (level - 1) + " assessment must be submitted first"));
            if (prev.getStatus() == AssessmentStatus.DRAFT) {
                throw new BadRequestException("Level " + (level - 1) + " assessment must be submitted before starting level " + level);
            }
        }

        TrainingAssessment assessment = assessmentRepo
                .findByTrainingRequestIdAndLevel(requestId, level)
                .orElse(TrainingAssessment.builder()
                        .trainingRequest(request)
                        .employee(employee)
                        .level(level)
                        .status(AssessmentStatus.DRAFT)
                        .build());

        if (assessment.getStatus() == AssessmentStatus.SUBMITTED ||
            assessment.getStatus() == AssessmentStatus.SUPERVISOR_SUBMITTED ||
            assessment.getStatus() == AssessmentStatus.REVIEWED) {
            throw new BadRequestException("Assessment level " + level + " has already been submitted");
        }

        assessment.setEmployeeData(formData);
        assessment.setStatus(AssessmentStatus.SUBMITTED);
        assessment.setSubmittedAt(LocalDateTime.now());
        return toDto(assessmentRepo.save(assessment));
    }

    public TrainingAssessmentDto saveDraft(String email, Long requestId, int level, String formData) {
        User employee = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        TrainingRequest request = requestRepo.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Training request not found"));

        TrainingAssessment assessment = assessmentRepo
                .findByTrainingRequestIdAndLevel(requestId, level)
                .orElse(TrainingAssessment.builder()
                        .trainingRequest(request)
                        .employee(employee)
                        .level(level)
                        .status(AssessmentStatus.DRAFT)
                        .build());

        if (assessment.getStatus() != AssessmentStatus.DRAFT) {
            throw new BadRequestException("Assessment level " + level + " has already been submitted and cannot be edited");
        }

        assessment.setEmployeeData(formData);
        return toDto(assessmentRepo.save(assessment));
    }

    public TrainingAssessmentDto submitSupervisorAssessment(String email, Long assessmentId, String supervisorData) {
        User supervisor = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        TrainingAssessment assessment = assessmentRepo.findById(assessmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment not found"));

        if (assessment.getLevel() != 3) {
            throw new BadRequestException("Supervisor evaluation is only for Level 3");
        }
        if (assessment.getStatus() != AssessmentStatus.SUBMITTED) {
            throw new BadRequestException("Employee must submit Part A before supervisor can submit Part B");
        }

        assessment.setSupervisorData(supervisorData);
        assessment.setSupervisorSubmittedBy(supervisor);
        assessment.setSupervisorSubmittedAt(LocalDateTime.now());
        assessment.setStatus(AssessmentStatus.SUPERVISOR_SUBMITTED);
        return toDto(assessmentRepo.save(assessment));
    }

    public TrainingAssessmentDto hrReview(String email, Long assessmentId, String comments) {
        User hr = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        TrainingAssessment assessment = assessmentRepo.findById(assessmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment not found"));

        assessment.setHrComments(comments);
        assessment.setReviewedBy(hr);
        assessment.setReviewedAt(LocalDateTime.now());
        assessment.setStatus(AssessmentStatus.REVIEWED);
        return toDto(assessmentRepo.save(assessment));
    }

    private TrainingAssessmentDto toDto(TrainingAssessment a) {
        return TrainingAssessmentDto.builder()
                .id(a.getId())
                .requestId(a.getTrainingRequest().getId())
                .requestTitle(a.getTrainingRequest().getTitle())
                .employeeId(a.getEmployee().getId())
                .employeeName(a.getEmployee().getFullName())
                .level(a.getLevel())
                .status(a.getStatus().name())
                .employeeData(a.getEmployeeData())
                .supervisorData(a.getSupervisorData())
                .supervisorName(a.getSupervisorSubmittedBy() != null ? a.getSupervisorSubmittedBy().getFullName() : null)
                .supervisorSubmittedAt(a.getSupervisorSubmittedAt())
                .hrComments(a.getHrComments())
                .reviewedByName(a.getReviewedBy() != null ? a.getReviewedBy().getFullName() : null)
                .reviewedAt(a.getReviewedAt())
                .submittedAt(a.getSubmittedAt())
                .createdAt(a.getCreatedAt())
                .build();
    }
}
