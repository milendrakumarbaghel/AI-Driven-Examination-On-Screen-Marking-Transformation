package org.springboot.backend.service;

import lombok.RequiredArgsConstructor;
import org.springboot.backend.dto.exam.QuestionRequest;
import org.springboot.backend.dto.exam.QuestionResponse;
import org.springboot.backend.dto.exam.RubricDto;
import org.springboot.backend.entity.Exam;
import org.springboot.backend.entity.Question;
import org.springboot.backend.entity.Rubric;
import org.springboot.backend.exception.ResourceNotFoundException;
import org.springboot.backend.repository.ExamRepository;
import org.springboot.backend.repository.QuestionRepository;
import org.springboot.backend.repository.RubricRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final ExamRepository examRepository;
    private final RubricRepository rubricRepository;

    public List<QuestionResponse> getQuestionsByExamId(Long examId) {
        return questionRepository.findByExamIdOrderByQuestionNumberAsc(examId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public QuestionResponse addQuestion(Long examId, QuestionRequest request) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + examId));

        Question question = Question.builder()
                .exam(exam)
                .questionNumber(request.getQuestionNumber())
                .questionText(request.getQuestionText())
                .maxMarks(request.getMaxMarks())
                .build();

        if (request.getRubric() != null) {
            Rubric rubric = Rubric.builder()
                    .question(question)
                    .modelAnswer(request.getRubric().getModelAnswer())
                    .criteria(request.getRubric().getCriteria())
                    .keywords(request.getRubric().getKeywords())
                    .build();
            question.setRubric(rubric);
        }

        question = questionRepository.save(question);

        // Recalculate exam total marks
        updateExamTotalMarks(exam);

        return toResponse(question);
    }

    @Transactional
    public QuestionResponse updateQuestion(Long questionId, QuestionRequest request) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + questionId));

        question.setQuestionNumber(request.getQuestionNumber());
        question.setQuestionText(request.getQuestionText());
        question.setMaxMarks(request.getMaxMarks());

        if (request.getRubric() != null) {
            if (question.getRubric() != null) {
                question.getRubric().setModelAnswer(request.getRubric().getModelAnswer());
                question.getRubric().setCriteria(request.getRubric().getCriteria());
                question.getRubric().setKeywords(request.getRubric().getKeywords());
            } else {
                Rubric rubric = Rubric.builder()
                        .question(question)
                        .modelAnswer(request.getRubric().getModelAnswer())
                        .criteria(request.getRubric().getCriteria())
                        .keywords(request.getRubric().getKeywords())
                        .build();
                question.setRubric(rubric);
            }
        }

        question = questionRepository.save(question);
        updateExamTotalMarks(question.getExam());

        return toResponse(question);
    }

    @Transactional
    public void deleteQuestion(Long questionId) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + questionId));
        Exam exam = question.getExam();
        questionRepository.delete(question);
        updateExamTotalMarks(exam);
    }

    private void updateExamTotalMarks(Exam exam) {
        List<Question> questions = questionRepository.findByExamIdOrderByQuestionNumberAsc(exam.getId());
        double total = questions.stream().mapToDouble(Question::getMaxMarks).sum();
        exam.setTotalMarks(total);
        examRepository.save(exam);
    }

    public QuestionResponse toResponse(Question question) {
        RubricDto rubricDto = null;
        if (question.getRubric() != null) {
            rubricDto = RubricDto.builder()
                    .id(question.getRubric().getId())
                    .modelAnswer(question.getRubric().getModelAnswer())
                    .criteria(question.getRubric().getCriteria())
                    .keywords(question.getRubric().getKeywords())
                    .build();
        }

        return QuestionResponse.builder()
                .id(question.getId())
                .examId(question.getExam() != null ? question.getExam().getId() : null)
                .questionNumber(question.getQuestionNumber())
                .questionText(question.getQuestionText())
                .maxMarks(question.getMaxMarks())
                .rubric(rubricDto)
                .build();
    }
}
