package org.springboot.backend.service;

import lombok.RequiredArgsConstructor;
import org.springboot.backend.dto.exam.ExamRequest;
import org.springboot.backend.dto.exam.ExamResponse;
import org.springboot.backend.dto.exam.QuestionResponse;
import org.springboot.backend.dto.exam.SubjectDto;
import org.springboot.backend.entity.Exam;
import org.springboot.backend.entity.Subject;
import org.springboot.backend.entity.enums.ExamStatus;
import org.springboot.backend.exception.ResourceNotFoundException;
import org.springboot.backend.repository.ExamRepository;
import org.springboot.backend.repository.SubjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExamService {

    private final ExamRepository examRepository;
    private final SubjectRepository subjectRepository;
    private final QuestionService questionService;

    @Transactional(readOnly = true)
    public List<ExamResponse> getAllExams() {
        return examRepository.findAll().stream()
                .map(this::toResponseSummary)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ExamResponse getExamById(Long id) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + id));
        return toResponseDetail(exam);
    }

    @Transactional
    public ExamResponse createExam(ExamRequest request) {
        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + request.getSubjectId()));

        Exam exam = Exam.builder()
                .title(request.getTitle())
                .subject(subject)
                .totalMarks(request.getTotalMarks() != null ? request.getTotalMarks() : 0.0)
                .status(request.getStatus() != null ? request.getStatus() : ExamStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .build();

        exam = examRepository.save(exam);
        return toResponseDetail(exam);
    }

    @Transactional
    public ExamResponse updateExamStatus(Long id, ExamStatus status) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + id));
        exam.setStatus(status);
        exam = examRepository.save(exam);
        return toResponseDetail(exam);
    }

    public ExamResponse toResponseSummary(Exam exam) {
        SubjectDto subjectDto = SubjectDto.builder()
                .id(exam.getSubject().getId())
                .name(exam.getSubject().getName())
                .code(exam.getSubject().getCode())
                .build();

        return ExamResponse.builder()
                .id(exam.getId())
                .title(exam.getTitle())
                .subject(subjectDto)
                .totalMarks(exam.getTotalMarks())
                .status(exam.getStatus())
                .createdAt(exam.getCreatedAt())
                .questionCount(exam.getQuestions() != null ? exam.getQuestions().size() : 0)
                .build();
    }

    public ExamResponse toResponseDetail(Exam exam) {
        SubjectDto subjectDto = SubjectDto.builder()
                .id(exam.getSubject().getId())
                .name(exam.getSubject().getName())
                .code(exam.getSubject().getCode())
                .build();

        List<QuestionResponse> questions = questionService.getQuestionsByExamId(exam.getId());

        return ExamResponse.builder()
                .id(exam.getId())
                .title(exam.getTitle())
                .subject(subjectDto)
                .totalMarks(exam.getTotalMarks())
                .status(exam.getStatus())
                .createdAt(exam.getCreatedAt())
                .questionCount(questions.size())
                .questions(questions)
                .build();
    }
}
