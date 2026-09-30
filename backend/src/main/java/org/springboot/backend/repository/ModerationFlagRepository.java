package org.springboot.backend.repository;

import org.springboot.backend.entity.ModerationFlag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ModerationFlagRepository extends JpaRepository<ModerationFlag, Long> {
    List<ModerationFlag> findByResolvedFalseOrderByCreatedAtDesc();
    List<ModerationFlag> findByEvaluationId(Long evaluationId);
    long countByResolvedFalse();
}
