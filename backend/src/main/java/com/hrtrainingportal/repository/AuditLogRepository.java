package com.hrtrainingportal.repository;

import com.hrtrainingportal.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByTrainingRequestId(Long trainingRequestId);
}
