package org.springboot.backend.dto.evaluation;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springboot.backend.entity.enums.ModerationFlagType;
import org.springboot.backend.entity.enums.Severity;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlagRequest {
    private ModerationFlagType flagType;
    private Severity severity;

    @NotBlank(message = "Reason is required")
    private String reason;
}
