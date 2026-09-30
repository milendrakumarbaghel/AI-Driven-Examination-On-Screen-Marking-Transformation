package org.springboot.backend.dto.exam;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionResponse {
    private Long id;
    private Long examId;
    private Integer questionNumber;
    private String questionText;
    private Double maxMarks;
    private RubricDto rubric;
}
