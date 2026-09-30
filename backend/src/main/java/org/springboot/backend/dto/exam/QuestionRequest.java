package org.springboot.backend.dto.exam;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionRequest {
    @NotNull(message = "Question number is required")
    @Min(value = 1, message = "Question number must be at least 1")
    private Integer questionNumber;

    @NotBlank(message = "Question text is required")
    private String questionText;

    @NotNull(message = "Max marks is required")
    @Min(value = 1, message = "Max marks must be at least 1")
    private Double maxMarks;

    private RubricDto rubric;
}
