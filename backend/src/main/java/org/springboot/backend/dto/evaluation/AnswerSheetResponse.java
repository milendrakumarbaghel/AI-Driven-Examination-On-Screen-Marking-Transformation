package org.springboot.backend.dto.evaluation;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springboot.backend.entity.enums.ProcessingStatus;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnswerSheetResponse {
    private Long id;
    private Long examId;
    private String examTitle;
    private String subjectName;
    private String candidateReference;
    private String originalFileName;
    private String fileUrl;
    private ProcessingStatus processingStatus;
    private Double totalFinalMarks;
    private Double totalAiMarks;
    private Double totalMaxMarks;
    private String examinerNotes;
    private LocalDateTime createdAt;
    private LocalDateTime finalizedAt;
    private List<AnswerDto> answers;
    private Integer flagCount;
}
