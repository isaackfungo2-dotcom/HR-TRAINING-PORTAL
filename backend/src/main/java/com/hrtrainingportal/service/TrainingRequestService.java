package com.hrtrainingportal.service;

import com.hrtrainingportal.dto.*;
import com.hrtrainingportal.entity.*;
import com.hrtrainingportal.enums.*;
import com.hrtrainingportal.exception.BadRequestException;
import com.hrtrainingportal.exception.ResourceNotFoundException;
import com.hrtrainingportal.repository.*;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TrainingRequestService {

    private final TrainingRequestRepository requestRepo;
    private final UserRepository userRepo;
    private final ApprovalRepository approvalRepo;
    private final TrainingDocumentRepository docRepo;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    private static final String UPLOAD_DIR = System.getProperty("user.dir") + "/uploads";

    public TrainingRequestService(TrainingRequestRepository requestRepo, UserRepository userRepo,
                                  ApprovalRepository approvalRepo, TrainingDocumentRepository docRepo,
                                  AuditLogService auditLogService, NotificationService notificationService) {
        this.requestRepo = requestRepo;
        this.userRepo = userRepo;
        this.approvalRepo = approvalRepo;
        this.docRepo = docRepo;
        this.auditLogService = auditLogService;
        this.notificationService = notificationService;
    }

    public TrainingRequestDto createRequest(String email, CreateTrainingRequest dto, List<MultipartFile> files) {
        User employee = userRepo.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        TrainingRequest req = TrainingRequest.builder()
                .employee(employee)
                .supervisor(employee.getSupervisor())
                .title(dto.getTitle())
                .description(dto.getDescription())
                .objectives(dto.getObjectives())
                .trainingType(TrainingType.valueOf(dto.getTrainingType()))
                .proposedStartDate(dto.getProposedStartDate())
                .proposedEndDate(dto.getProposedEndDate())
                .provider(dto.getProvider())
                .institution(dto.getInstitution())
                .estimatedCost(dto.getEstimatedCost())
                .currency(dto.getCurrency())
                .justification(dto.getJustification())
                .expectedBenefits(dto.getExpectedBenefits())
                .status(RequestStatus.PENDING_SUPERVISOR)
                .build();
        req = requestRepo.save(req);

        if (files != null) {
            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    saveFile(req, file);
                }
            }
        }

        auditLogService.log(req, employee, "REQUEST_SUBMITTED", "Training request submitted", null, RequestStatus.PENDING_SUPERVISOR);

        if (employee.getSupervisor() != null) {
            notificationService.createNotification(employee.getSupervisor().getId(),
                    "New Training Request",
                    employee.getFullName() + " submitted a new training request: " + dto.getTitle(),
                    "/requests/" + req.getId());
        }

        return toDto(req);
    }

    public List<TrainingRequestDto> getEmployeeRequests(String email) {
        User user = userRepo.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return requestRepo.findByEmployeeId(user.getId()).stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<TrainingRequestDto> getSupervisorPendingRequests(String email) {
        User user = userRepo.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return requestRepo.findBySupervisorIdAndStatus(user.getId(), RequestStatus.PENDING_SUPERVISOR)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<TrainingRequestDto> getSupervisorAllRequests(String email) {
        User user = userRepo.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return requestRepo.findBySupervisorId(user.getId())
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<TrainingRequestDto> getAllRequests(RequestStatus status, Long departmentId, String keyword) {
        Specification<TrainingRequest> spec = Specification.where(null);
        if (status != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
        }
        if (departmentId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("employee").get("department").get("id"), departmentId));
        }
        if (keyword != null && !keyword.isBlank()) {
            String like = "%" + keyword.toLowerCase() + "%";
            spec = spec.and((root, query, cb) ->
                cb.or(
                    cb.like(cb.lower(root.get("title")), like),
                    cb.like(cb.lower(root.get("employee").get("firstName")), like),
                    cb.like(cb.lower(root.get("employee").get("lastName")), like)
                )
            );
        }
        return requestRepo.findAll(spec, Sort.by("createdAt").descending())
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public TrainingRequestDto getRequest(Long id) {
        return toDto(requestRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Request not found")));
    }

    public TrainingRequestDto supervisorAction(Long requestId, String email, ApprovalAction actionDto) {
        User supervisor = userRepo.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        TrainingRequest req = requestRepo.findById(requestId).orElseThrow(() -> new ResourceNotFoundException("Request not found"));

        if (req.getStatus() != RequestStatus.PENDING_SUPERVISOR) {
            throw new BadRequestException("Request is not pending supervisor approval");
        }
        if (req.getSupervisor() == null || !req.getSupervisor().getId().equals(supervisor.getId())) {
            throw new BadRequestException("You are not the supervisor for this request");
        }

        RequestStatus oldStatus = req.getStatus();
        if ("APPROVE".equalsIgnoreCase(actionDto.getAction())) {
            req.setStatus(RequestStatus.SUPERVISOR_APPROVED);
            auditLogService.log(req, supervisor, "SUPERVISOR_APPROVED", "Supervisor approved request", oldStatus, req.getStatus());
            approvalRepo.save(Approval.builder().trainingRequest(req).approver(supervisor).status(RequestStatus.SUPERVISOR_APPROVED).comments(actionDto.getComments()).build());
            notificationService.createNotification(req.getEmployee().getId(), "Request Approved by Supervisor",
                    "Your training request '" + req.getTitle() + "' has been approved by your supervisor and is pending HR review.", "/requests/" + req.getId());
            // notify HR users - find all HR personnel
            List<User> hrUsers = userRepo.findAll().stream().filter(u -> u.getRole() == Role.HR).collect(Collectors.toList());
            for (User hr : hrUsers) {
                notificationService.createNotification(hr.getId(), "Training Request Pending HR Approval",
                        "New training request '" + req.getTitle() + "' from " + req.getEmployee().getFullName() + " requires HR approval.", "/requests/" + req.getId());
            }
        } else if ("REJECT".equalsIgnoreCase(actionDto.getAction())) {
            if (actionDto.getReason() == null || actionDto.getReason().isBlank()) {
                throw new BadRequestException("Rejection reason is mandatory");
            }
            req.setStatus(RequestStatus.REJECTED);
            req.setRejectionReason(actionDto.getReason());
            auditLogService.log(req, supervisor, "SUPERVISOR_REJECTED", "Supervisor rejected: " + actionDto.getReason(), oldStatus, req.getStatus());
            approvalRepo.save(Approval.builder().trainingRequest(req).approver(supervisor).status(RequestStatus.REJECTED).reason(actionDto.getReason()).comments(actionDto.getComments()).build());
            notificationService.createNotification(req.getEmployee().getId(), "Request Rejected by Supervisor",
                    "Your training request '" + req.getTitle() + "' was rejected by your supervisor. Reason: " + actionDto.getReason(), "/requests/" + req.getId());
        } else {
            throw new BadRequestException("Invalid action");
        }

        return toDto(requestRepo.save(req));
    }

    public TrainingRequestDto hrAction(Long requestId, String email, ApprovalAction actionDto) {
        User hr = userRepo.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        TrainingRequest req = requestRepo.findById(requestId).orElseThrow(() -> new ResourceNotFoundException("Request not found"));

        if (req.getStatus() != RequestStatus.SUPERVISOR_APPROVED) {
            throw new BadRequestException("Request is not pending HR approval");
        }

        RequestStatus oldStatus = req.getStatus();
        if ("APPROVE".equalsIgnoreCase(actionDto.getAction())) {
            req.setStatus(RequestStatus.HR_APPROVED);
            req.setHrApprover(hr);
            auditLogService.log(req, hr, "HR_APPROVED", "HR approved request", oldStatus, req.getStatus());
            approvalRepo.save(Approval.builder().trainingRequest(req).approver(hr).status(RequestStatus.HR_APPROVED).comments(actionDto.getComments()).build());
            notificationService.createNotification(req.getEmployee().getId(), "Request Approved by HR",
                    "Your training request '" + req.getTitle() + "' has been fully approved by HR.", "/requests/" + req.getId());
        } else if ("REJECT".equalsIgnoreCase(actionDto.getAction())) {
            if (actionDto.getReason() == null || actionDto.getReason().isBlank()) {
                throw new BadRequestException("Rejection reason is mandatory");
            }
            req.setStatus(RequestStatus.REJECTED);
            req.setRejectionReason(actionDto.getReason());
            auditLogService.log(req, hr, "HR_REJECTED", "HR rejected: " + actionDto.getReason(), oldStatus, req.getStatus());
            approvalRepo.save(Approval.builder().trainingRequest(req).approver(hr).status(RequestStatus.REJECTED).reason(actionDto.getReason()).comments(actionDto.getComments()).build());
            notificationService.createNotification(req.getEmployee().getId(), "Request Rejected by HR",
                    "Your training request '" + req.getTitle() + "' was rejected by HR. Reason: " + actionDto.getReason(), "/requests/" + req.getId());
        } else if ("RESCHEDULE".equalsIgnoreCase(actionDto.getAction())) {
            if (actionDto.getNewStartDate() == null || actionDto.getNewEndDate() == null) {
                throw new BadRequestException("New dates are required for rescheduling");
            }
            req.setRescheduledStartDate(actionDto.getNewStartDate());
            req.setRescheduledEndDate(actionDto.getNewEndDate());
            req.setRescheduleComment(actionDto.getComments());
            req.setStatus(RequestStatus.RESCHEDULED);
            auditLogService.log(req, hr, "HR_RESCHEDULED", "HR rescheduled request", oldStatus, req.getStatus());
            approvalRepo.save(Approval.builder().trainingRequest(req).approver(hr).status(RequestStatus.RESCHEDULED).comments(actionDto.getComments()).build());
            notificationService.createNotification(req.getEmployee().getId(), "Request Rescheduled by HR",
                    "Your training request '" + req.getTitle() + "' has been rescheduled by HR. New dates: " + actionDto.getNewStartDate() + " to " + actionDto.getNewEndDate(), "/requests/" + req.getId());
        } else {
            throw new BadRequestException("Invalid action");
        }

        return toDto(requestRepo.save(req));
    }

    private void saveFile(TrainingRequest req, MultipartFile file) {
        try {
            Path dir = Paths.get(UPLOAD_DIR);
            if (!Files.exists(dir)) Files.createDirectories(dir);
            String uuid = UUID.randomUUID().toString();
            String filename = uuid + "_" + file.getOriginalFilename();
            Path target = dir.resolve(filename);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            TrainingDocument doc = TrainingDocument.builder()
                    .trainingRequest(req)
                    .fileName(file.getOriginalFilename())
                    .filePath(filename)
                    .fileType(file.getContentType())
                    .fileSize(file.getSize())
                    .build();
            docRepo.save(doc);
        } catch (IOException e) {
            throw new RuntimeException("File upload failed", e);
        }
    }

    public Path getFilePath(String fileName) {
        return Paths.get(UPLOAD_DIR).resolve(fileName);
    }

    public List<TrainingDocumentDto> getDocumentsForRequest(Long requestId) {
        return docRepo.findByTrainingRequestId(requestId).stream()
                .map(d -> TrainingDocumentDto.builder()
                        .id(d.getId())
                        .fileName(d.getFileName())
                        .fileType(d.getFileType())
                        .fileSize(d.getFileSize())
                        .downloadUrl("/requests/documents/download/" + d.getFilePath())
                        .uploadedAt(d.getUploadedAt())
                        .build())
                .collect(Collectors.toList());
    }

    public java.nio.file.Path getDocumentPath(String filePath) {
        return java.nio.file.Paths.get(UPLOAD_DIR, filePath);
    }

    private TrainingRequestDto toDto(TrainingRequest r) {
        return TrainingRequestDto.builder()
                .id(r.getId())
                .employeeId(r.getEmployee() != null ? r.getEmployee().getId() : null)
                .employeeName(r.getEmployee() != null ? r.getEmployee().getFullName() : null)
                .departmentName(r.getEmployee() != null && r.getEmployee().getDepartment() != null ? r.getEmployee().getDepartment().getName() : null)
                .supervisorName(r.getSupervisor() != null ? r.getSupervisor().getFullName() : null)
                .title(r.getTitle())
                .description(r.getDescription())
                .objectives(r.getObjectives())
                .trainingType(r.getTrainingType())
                .proposedStartDate(r.getProposedStartDate())
                .proposedEndDate(r.getProposedEndDate())
                .provider(r.getProvider())
                .institution(r.getInstitution())
                .estimatedCost(r.getEstimatedCost())
                .currency(r.getCurrency())
                .justification(r.getJustification())
                .expectedBenefits(r.getExpectedBenefits())
                .status(r.getStatus())
                .supervisorId(r.getSupervisor() != null ? r.getSupervisor().getId() : null)
                .hrApproverId(r.getHrApprover() != null ? r.getHrApprover().getId() : null)
                .hrApproverName(r.getHrApprover() != null ? r.getHrApprover().getFullName() : null)
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .documents(r.getDocuments() != null ? r.getDocuments().stream().map(d -> TrainingDocumentDto.builder()
                        .id(d.getId())
                        .fileName(d.getFileName())
                        .fileType(d.getFileType())
                        .fileSize(d.getFileSize())
                        .downloadUrl("/requests/documents/download/" + d.getFilePath())
                        .uploadedAt(d.getUploadedAt())
                        .build()).collect(Collectors.toList()) : null)
                .rejectionReason(r.getRejectionReason())
                .rescheduleComment(r.getRescheduleComment())
                .rescheduledStartDate(r.getRescheduledStartDate())
                .rescheduledEndDate(r.getRescheduledEndDate())
                .build();
    }
}
