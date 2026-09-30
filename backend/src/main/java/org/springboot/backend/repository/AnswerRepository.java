package org.springboot.backend.repository;

import org.springboot.backend.entity.Answer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AnswerRepository extends JpaRepository<Answer, Long> {
    List<Answer> findByAnswerSheetIdOrderByIdAsc(Long answerSheetId);
    Optional<Answer> findByAnswerSheetIdAndQuestionId(Long answerSheetId, Long questionId);
}
