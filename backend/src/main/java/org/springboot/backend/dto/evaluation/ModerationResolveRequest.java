package org.springboot.backend.dto.evaluation;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ModerationResolveRequest {
    @NotBlank(message = "Resolution comment is required")
    private String resolutionComment;
}
