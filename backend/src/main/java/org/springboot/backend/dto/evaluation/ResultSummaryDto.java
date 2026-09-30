package org.springboot.backend.dto.evaluation;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResultSummaryDto {
    private Long answerSheetId;
    private String candidateReference;
    private String examTitle;
    private String subjectName;
    private String subjectCode;
    private Double totalFinalMarks;
    private Double totalAiMarks;
    private Double totalMaxMarks;
    private Double percentage;
    private String grade;
    private String moderationStatus;
    private LocalDateTime finalizedAt;
    private List<QuestionSummaryItem> questionSummaries;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class QuestionSummaryItem {
        private Integer questionNumber;
        private String questionText;
        private Double maxMarks;
        private Double aiSuggestedMarks;
        private Double finalExaminerMarks;
        private Double confidence;
        private String explanation;
        private String examinerComment;
    }
}
