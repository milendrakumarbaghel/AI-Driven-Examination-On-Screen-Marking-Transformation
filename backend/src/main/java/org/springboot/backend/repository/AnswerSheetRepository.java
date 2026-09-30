package org.springboot.backend.repository;

import org.springboot.backend.entity.AnswerSheet;
import org.springboot.backend.entity.enums.ProcessingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnswerSheetRepository extends JpaRepository<AnswerSheet, Long> {
    List<AnswerSheet> findByExamIdOrderByCreatedAtDesc(Long examId);
    long countByProcessingStatus(ProcessingStatus status);

    @Query("SELECT AVG(a.totalFinalMarks) FROM AnswerSheet a WHERE a.totalFinalMarks IS NOT NULL")
    Double calculateOverallAverageMarks();

    @Query("SELECT a FROM AnswerSheet a ORDER BY a.createdAt DESC")
    List<AnswerSheet> findAllOrderByCreatedAtDesc();
}
