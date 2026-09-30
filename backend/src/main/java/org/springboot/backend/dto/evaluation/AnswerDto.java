package org.springboot.backend.dto.evaluation;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springboot.backend.dto.exam.RubricDto;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnswerDto {
    private Long id;
    private Long questionId;
    private Integer questionNumber;
    private String questionText;
    private Double maxMarks;
    private RubricDto rubric;
    private String extractedText;
    private Double ocrConfidence;
    private EvaluationDto evaluation;
}
