package org.springboot.backend.dto.exam;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springboot.backend.entity.enums.ExamStatus;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamRequest {
    @NotBlank(message = "Exam title is required")
    private String title;

    @NotNull(message = "Subject ID is required")
    private Long subjectId;

    private Double totalMarks;

    private ExamStatus status;
}
