package org.springboot.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springboot.backend.entity.AnswerSheet;
import org.springboot.backend.exception.ResourceNotFoundException;
import org.springboot.backend.repository.AnswerSheetRepository;
import org.springboot.backend.service.FileStorageService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final AnswerSheetRepository answerSheetRepository;
    private final FileStorageService fileStorageService;

    @GetMapping("/{answerSheetId}")
    public ResponseEntity<Resource> serveFile(@PathVariable Long answerSheetId) {
        AnswerSheet answerSheet = answerSheetRepository.findById(answerSheetId)
                .orElseThrow(() -> new ResourceNotFoundException("Answer sheet not found: " + answerSheetId));

        Resource resource = fileStorageService.loadFileAsResource(answerSheet.getFilePath());

        String contentType = "application/octet-stream";
        try {
            contentType = Files.probeContentType(Paths.get(answerSheet.getFilePath()));
            if (contentType == null) {
                if (answerSheet.getFilePath().toLowerCase().endsWith(".pdf")) {
                    contentType = "application/pdf";
                } else if (answerSheet.getFilePath().toLowerCase().endsWith(".png")) {
                    contentType = "image/png";
                } else if (answerSheet.getFilePath().toLowerCase().endsWith(".jpg") || answerSheet.getFilePath().toLowerCase().endsWith(".jpeg")) {
                    contentType = "image/jpeg";
                }
            }
        } catch (IOException ignored) {
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + answerSheet.getOriginalFileName() + "\"")
                .body(resource);
    }
}
