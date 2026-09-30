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
public class AiOcrResponse {
    private boolean success;
    private String message;
    @Builder.Default
    private List<ExtractedAnswerItem> answers = new ArrayList<>();
}
