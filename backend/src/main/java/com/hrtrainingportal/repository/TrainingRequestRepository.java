package com.hrtrainingportal.repository;

import com.hrtrainingportal.entity.TrainingRequest;
import com.hrtrainingportal.enums.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TrainingRequestRepository extends JpaRepository<TrainingRequest, Long>, JpaSpecificationExecutor<TrainingRequest> {
    List<TrainingRequest> findByEmployeeId(Long employeeId);
    List<TrainingRequest> findBySupervisorId(Long supervisorId);
    List<TrainingRequest> findBySupervisorIdAndStatus(Long supervisorId, RequestStatus status);
    List<TrainingRequest> findByStatus(RequestStatus status);
    List<TrainingRequest> findByProposedStartDateBetween(LocalDate start, LocalDate end);
    long countByStatus(RequestStatus status);
    long countByEmployeeDepartmentIdAndStatus(Long departmentId, RequestStatus status);
}
