package org.springboot.backend.repository;

import org.springboot.backend.entity.Exam;
import org.springboot.backend.entity.enums.ExamStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExamRepository extends JpaRepository<Exam, Long> {
    List<Exam> findByStatus(ExamStatus status);
}
