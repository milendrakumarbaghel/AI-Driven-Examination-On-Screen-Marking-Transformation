package org.springboot.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springboot.backend.dto.evaluation.ModerationFlagDto;
import org.springboot.backend.dto.evaluation.ModerationResolveRequest;
import org.springboot.backend.service.ModerationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/moderation")
@RequiredArgsConstructor
public class ModerationController {

    private final ModerationService moderationService;

    @GetMapping("/flags")
    @PreAuthorize("hasAnyRole('ADMIN', 'MODERATOR')")
    public ResponseEntity<List<ModerationFlagDto>> getPendingFlags() {
        return ResponseEntity.ok(moderationService.getPendingFlags());
    }

    @PutMapping("/flags/{id}/resolve")
    @PreAuthorize("hasAnyRole('ADMIN', 'MODERATOR')")
    public ResponseEntity<ModerationFlagDto> resolveFlag(
            @PathVariable Long id,
            @Valid @RequestBody ModerationResolveRequest request) {
        return ResponseEntity.ok(moderationService.resolveFlag(id, request));
    }
}
