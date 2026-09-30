package org.springboot.backend.dto.exam;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RubricDto {
    private Long id;

    @NotBlank(message = "Model answer is required")
    private String modelAnswer;

    @NotBlank(message = "Evaluation criteria are required")
    private String criteria;

    private String keywords;
}
