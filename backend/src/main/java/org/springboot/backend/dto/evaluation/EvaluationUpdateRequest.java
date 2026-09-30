package org.springboot.backend.dto.evaluation;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvaluationUpdateRequest {
    @NotNull(message = "Examiner marks cannot be null")
    @DecimalMin(value = "0.0", message = "Marks cannot be negative")
    private Double examinerMarks;

    private String examinerComment;
}
