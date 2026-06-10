package com.hrtrainingportal.repository;

import com.hrtrainingportal.entity.Approval;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApprovalRepository extends JpaRepository<Approval, Long> {
    List<Approval> findByTrainingRequestId(Long trainingRequestId);
}
