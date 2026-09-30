package org.springboot.backend.dto.evaluation;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springboot.backend.entity.enums.EvaluationStatus;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvaluationDto {
    private Long id;
    private Long answerId;
    private Double aiSuggestedMarks;
    private Double examinerMarks;
    private Double maxMarks;
    private Double aiConfidence;
    private String explanation;
    private List<String> matchedConcepts;
    private List<String> missingConcepts;
    private String examinerComment;
    private EvaluationStatus status;
    private LocalDateTime finalizedAt;
    private List<ModerationFlagDto> moderationFlags;
}
