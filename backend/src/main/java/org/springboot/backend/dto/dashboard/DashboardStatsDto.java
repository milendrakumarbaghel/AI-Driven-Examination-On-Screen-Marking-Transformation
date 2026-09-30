package org.springboot.backend.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsDto {
    private long totalExams;
    private long totalAnswerSheets;
    private long evaluatedSheets;
    private long pendingSheets;
    private long flaggedForReview;
    private double overallAverageMarks;
    private double averageAiVsExaminerDiff;
    private long lowConfidenceCount;

    private List<QuestionStat> questionPerformance;
    private List<ProgressStat> progressBreakdown;
    private List<DifficultyStat> questionDifficulty;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class QuestionStat {
        private String questionNumber;
        private Double avgMarks;
        private Double maxMarks;
        private Double avgAiMarks;
        private Double diff;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProgressStat {
        private String name;
        private long value;
        private String color;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DifficultyStat {
        private String question;
        private double percentage;
        private String difficulty; // Easy, Moderate, Difficult
    }
}
