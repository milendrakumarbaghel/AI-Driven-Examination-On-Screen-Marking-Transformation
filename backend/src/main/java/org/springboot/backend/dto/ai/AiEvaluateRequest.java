package org.springboot.backend.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiEvaluateRequest {
    private String question;
    private Double maxMarks;
    private String modelAnswer;
    private String rubric;
    private String studentAnswer;
}
