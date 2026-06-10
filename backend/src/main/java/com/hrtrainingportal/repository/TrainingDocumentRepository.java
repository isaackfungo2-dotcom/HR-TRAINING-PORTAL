package com.hrtrainingportal.repository;

import com.hrtrainingportal.entity.TrainingDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrainingDocumentRepository extends JpaRepository<TrainingDocument, Long> {
    List<TrainingDocument> findByTrainingRequestId(Long trainingRequestId);
}
