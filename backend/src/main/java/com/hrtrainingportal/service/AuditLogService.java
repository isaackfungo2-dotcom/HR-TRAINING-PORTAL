package com.hrtrainingportal.service;

import com.hrtrainingportal.dto.AuditLogDto;
import com.hrtrainingportal.entity.AuditLog;
import com.hrtrainingportal.entity.TrainingRequest;
import com.hrtrainingportal.entity.User;
import com.hrtrainingportal.enums.RequestStatus;
import com.hrtrainingportal.repository.AuditLogRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void log(TrainingRequest request, User user, String action, String details,
                    RequestStatus oldStatus, RequestStatus newStatus) {
        AuditLog log = AuditLog.builder()
                .trainingRequest(request)
                .user(user)
                .action(action)
                .details(details)
                .oldStatus(oldStatus)
                .newStatus(newStatus)
                .build();
        auditLogRepository.save(log);
    }

    public List<AuditLogDto> getLogsForRequest(Long requestId) {
        return auditLogRepository.findByTrainingRequestId(requestId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private AuditLogDto toDto(AuditLog log) {
        return AuditLogDto.builder()
                .id(log.getId())
                .requestId(log.getTrainingRequest() != null ? log.getTrainingRequest().getId() : null)
                .userId(log.getUser() != null ? log.getUser().getId() : null)
                .userName(log.getUser() != null ? log.getUser().getFullName() : null)
                .action(log.getAction())
                .details(log.getDetails())
                .oldStatus(log.getOldStatus() != null ? log.getOldStatus().name() : null)
                .newStatus(log.getNewStatus() != null ? log.getNewStatus().name() : null)
                .timestamp(log.getTimestamp())
                .build();
    }
}
