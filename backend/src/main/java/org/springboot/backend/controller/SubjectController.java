package org.springboot.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springboot.backend.dto.exam.SubjectDto;
import org.springboot.backend.service.SubjectService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subjects")
@RequiredArgsConstructor
public class SubjectController {

    private final SubjectService subjectService;

    @GetMapping
    public ResponseEntity<List<SubjectDto>> getAllSubjects() {
        return ResponseEntity.ok(subjectService.getAllSubjects());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubjectDto> getSubjectById(@PathVariable Long id) {
        return ResponseEntity.ok(subjectService.getSubjectById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SubjectDto> createSubject(@Valid @RequestBody SubjectDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(subjectService.createSubject(dto));
    }
}
