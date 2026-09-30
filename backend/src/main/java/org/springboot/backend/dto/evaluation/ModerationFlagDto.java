package org.springboot.backend.dto.evaluation;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springboot.backend.entity.enums.ModerationFlagType;
import org.springboot.backend.entity.enums.Severity;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ModerationFlagDto {
    private Long id;
    private Long evaluationId;
    private Long answerSheetId;
    private String candidateReference;
    private String examTitle;
    private Integer questionNumber;
    private ModerationFlagType flagType;
    private Severity severity;
    private String reason;
    private boolean resolved;
    private String resolutionComment;
    private LocalDateTime createdAt;
    private Double aiMarks;
    private Double examinerMarks;
    private Double confidence;
}
