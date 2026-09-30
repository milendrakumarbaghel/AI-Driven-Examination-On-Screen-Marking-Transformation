package org.springboot.backend.repository;

import org.springboot.backend.entity.Evaluation;
import org.springboot.backend.entity.enums.EvaluationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {
    Optional<Evaluation> findByAnswerId(Long answerId);

    List<Evaluation> findByStatus(EvaluationStatus status);

    @Query("SELECT e FROM Evaluation e WHERE e.aiConfidence IS NOT NULL AND e.aiConfidence < :threshold")
    List<Evaluation> findLowConfidenceEvaluations(Double threshold);

    @Query("SELECT AVG(ABS(e.examinerMarks - e.aiSuggestedMarks)) FROM Evaluation e WHERE e.examinerMarks IS NOT NULL AND e.aiSuggestedMarks IS NOT NULL")
    Double calculateAverageAiVsExaminerDiff();

    @Query("SELECT e.answer.question.id, e.answer.question.questionNumber, AVG(COALESCE(e.examinerMarks, e.aiSuggestedMarks)), e.answer.question.maxMarks " +
           "FROM Evaluation e WHERE e.examinerMarks IS NOT NULL OR e.aiSuggestedMarks IS NOT NULL " +
           "GROUP BY e.answer.question.id, e.answer.question.questionNumber, e.answer.question.maxMarks " +
           "ORDER BY e.answer.question.questionNumber ASC")
    List<Object[]> findQuestionPerformanceStats();
}
