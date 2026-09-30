package org.springboot.backend.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiEvaluateResponse {
    private Double suggestedMarks;
    private Double maxMarks;
    private Double confidence;
    @Builder.Default
    private List<String> matchedConcepts = new ArrayList<>();
    @Builder.Default
    private List<String> missingConcepts = new ArrayList<>();
    private String explanation;
}
