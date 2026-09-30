package org.springboot.backend.dto.exam;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springboot.backend.entity.enums.ExamStatus;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamResponse {
    private Long id;
    private String title;
    private SubjectDto subject;
    private Double totalMarks;
    private ExamStatus status;
    private LocalDateTime createdAt;
    private Integer questionCount;
    private List<QuestionResponse> questions;
}
