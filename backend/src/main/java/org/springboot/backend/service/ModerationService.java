package org.springboot.backend.service;

import lombok.RequiredArgsConstructor;
import org.springboot.backend.dto.evaluation.ModerationFlagDto;
import org.springboot.backend.dto.evaluation.ModerationResolveRequest;
import org.springboot.backend.entity.ModerationFlag;
import org.springboot.backend.exception.ResourceNotFoundException;
import org.springboot.backend.repository.ModerationFlagRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ModerationService {

    private final ModerationFlagRepository moderationFlagRepository;
    private final AnswerSheetService answerSheetService;

    public List<ModerationFlagDto> getPendingFlags() {
        return moderationFlagRepository.findByResolvedFalseOrderByCreatedAtDesc().stream()
                .map(answerSheetService::toModerationFlagDto)
                .collect(Collectors.toList());
    }

    public List<ModerationFlagDto> getAllFlags() {
        return moderationFlagRepository.findAll().stream()
                .map(answerSheetService::toModerationFlagDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ModerationFlagDto resolveFlag(Long id, ModerationResolveRequest request) {
        ModerationFlag flag = moderationFlagRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Moderation flag not found: " + id));

        flag.setResolved(true);
        flag.setResolutionComment(request.getResolutionComment());
        flag = moderationFlagRepository.save(flag);

        return answerSheetService.toModerationFlagDto(flag);
    }
}
