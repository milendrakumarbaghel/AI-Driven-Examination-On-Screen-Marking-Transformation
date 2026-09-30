package org.springboot.backend.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExtractedAnswerItem {
    private Integer questionNumber;
    private String text;
    private Double ocrConfidence;
}
