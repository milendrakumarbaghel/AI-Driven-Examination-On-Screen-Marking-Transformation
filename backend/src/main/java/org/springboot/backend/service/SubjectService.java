package org.springboot.backend.service;

import lombok.RequiredArgsConstructor;
import org.springboot.backend.dto.exam.SubjectDto;
import org.springboot.backend.entity.Subject;
import org.springboot.backend.exception.BadRequestException;
import org.springboot.backend.exception.ResourceNotFoundException;
import org.springboot.backend.repository.SubjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubjectService {

    private final SubjectRepository subjectRepository;

    public List<SubjectDto> getAllSubjects() {
        return subjectRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public SubjectDto getSubjectById(Long id) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + id));
        return toDto(subject);
    }

    @Transactional
    public SubjectDto createSubject(SubjectDto dto) {
        if (subjectRepository.existsByCode(dto.getCode())) {
            throw new BadRequestException("Subject code already exists: " + dto.getCode());
        }

        Subject subject = Subject.builder()
                .name(dto.getName())
                .code(dto.getCode().toUpperCase().trim())
                .build();

        subject = subjectRepository.save(subject);
        return toDto(subject);
    }

    public SubjectDto toDto(Subject subject) {
        return SubjectDto.builder()
                .id(subject.getId())
                .name(subject.getName())
                .code(subject.getCode())
                .build();
    }
}
