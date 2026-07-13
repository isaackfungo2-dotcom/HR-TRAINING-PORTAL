package com.hrtrainingportal.repository;

import com.hrtrainingportal.entity.TrainingAssessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssessmentRepository extends JpaRepository<TrainingAssessment, Long> {
    List<TrainingAssessment> findByTrainingRequestId(Long requestId);
    List<TrainingAssessment> findByEmployeeId(Long employeeId);
    Optional<TrainingAssessment> findByTrainingRequestIdAndLevel(Long requestId, int level);
}
