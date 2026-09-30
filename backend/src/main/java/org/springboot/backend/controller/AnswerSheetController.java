package org.springboot.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springboot.backend.dto.evaluation.*;
import org.springboot.backend.service.AnswerSheetService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AnswerSheetController {

    private final AnswerSheetService answerSheetService;

    @GetMapping("/exams/{examId}/answer-sheets")
    public ResponseEntity<List<AnswerSheetResponse>> getAnswerSheetsByExam(@PathVariable Long examId) {
        return ResponseEntity.ok(answerSheetService.getAnswerSheetsByExam(examId));
    }

    @GetMapping("/answer-sheets")
    public ResponseEntity<List<AnswerSheetResponse>> getAllAnswerSheets() {
        return ResponseEntity.ok(answerSheetService.getAllAnswerSheets());
    }

    @GetMapping("/answer-sheets/{id}")
    public ResponseEntity<AnswerSheetResponse> getAnswerSheetById(@PathVariable Long id) {
        return ResponseEntity.ok(answerSheetService.getAnswerSheetById(id));
    }

    @PostMapping(value = "/exams/{examId}/answer-sheets", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'EXAMINER')")
    public ResponseEntity<AnswerSheetResponse> uploadAnswerSheet(
            @PathVariable Long examId,
            @RequestParam("candidateReference") String candidateReference,
            @RequestParam("file") MultipartFile file) {

        AnswerSheetResponse response = answerSheetService.uploadAnswerSheet(examId, candidateReference, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/answer-sheets/{id}/process-ocr")
    @PreAuthorize("hasAnyRole('ADMIN', 'EXAMINER')")
    public ResponseEntity<AnswerSheetResponse> processOcr(@PathVariable Long id) {
        return ResponseEntity.ok(answerSheetService.processOcr(id));
    }

    @PostMapping("/answer-sheets/{id}/evaluate-all")
    @PreAuthorize("hasAnyRole('ADMIN', 'EXAMINER')")
    public ResponseEntity<AnswerSheetResponse> evaluateAll(@PathVariable Long id) {
        return ResponseEntity.ok(answerSheetService.evaluateAll(id));
    }

    @PutMapping("/answers/{answerId}/text")
    @PreAuthorize("hasAnyRole('ADMIN', 'EXAMINER')")
    public ResponseEntity<AnswerSheetResponse> updateExtractedText(
            @PathVariable Long answerId,
            @RequestBody Map<String, String> payload) {
        String text = payload.getOrDefault("text", "");
        return ResponseEntity.ok(answerSheetService.updateExtractedText(answerId, text));
    }

    @PutMapping("/evaluations/{evaluationId}/examiner-mark")
    @PreAuthorize("hasAnyRole('ADMIN', 'EXAMINER')")
    public ResponseEntity<EvaluationDto> updateExaminerMark(
            @PathVariable Long evaluationId,
            @Valid @RequestBody EvaluationUpdateRequest request) {
        return ResponseEntity.ok(answerSheetService.updateExaminerMark(
                evaluationId, request.getExaminerMarks(), request.getExaminerComment()));
    }

    @PostMapping("/evaluations/{evaluationId}/flag")
    @PreAuthorize("hasAnyRole('ADMIN', 'EXAMINER')")
    public ResponseEntity<ModerationFlagDto> flagEvaluation(
            @PathVariable Long evaluationId,
            @Valid @RequestBody FlagRequest request) {
        return ResponseEntity.ok(answerSheetService.flagEvaluation(evaluationId, request));
    }

    @PostMapping("/answer-sheets/{id}/finalize")
    @PreAuthorize("hasAnyRole('ADMIN', 'EXAMINER')")
    public ResponseEntity<AnswerSheetResponse> finalizeAnswerSheet(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> payload) {
        String notes = payload != null ? payload.get("notes") : "";
        return ResponseEntity.ok(answerSheetService.finalizeAnswerSheet(id, notes));
    }

    @GetMapping("/answer-sheets/{id}/summary")
    public ResponseEntity<ResultSummaryDto> getSummary(@PathVariable Long id) {
        return ResponseEntity.ok(answerSheetService.getSummary(id));
    }
}
