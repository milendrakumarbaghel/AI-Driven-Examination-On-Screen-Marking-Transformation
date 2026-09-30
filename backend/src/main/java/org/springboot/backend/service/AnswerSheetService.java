package org.springboot.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springboot.backend.dto.ai.AiEvaluateRequest;
import org.springboot.backend.dto.ai.AiEvaluateResponse;
import org.springboot.backend.dto.ai.AiOcrResponse;
import org.springboot.backend.dto.ai.ExtractedAnswerItem;
import org.springboot.backend.dto.evaluation.*;
import org.springboot.backend.dto.exam.RubricDto;
import org.springboot.backend.entity.*;
import org.springboot.backend.entity.enums.*;
import org.springboot.backend.exception.BadRequestException;
import org.springboot.backend.exception.ResourceNotFoundException;
import org.springboot.backend.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnswerSheetService {

    private final AnswerSheetRepository answerSheetRepository;
    private final ExamRepository examRepository;
    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;
    private final EvaluationRepository evaluationRepository;
    private final ModerationFlagRepository moderationFlagRepository;
    private final FileStorageService fileStorageService;
    private final AiProcessingService aiProcessingService;

    @Value("${app.moderation.variance-threshold:3.0}")
    private double varianceThreshold;

    @Value("${app.moderation.confidence-threshold:0.70}")
    private double confidenceThreshold;

    @Transactional(readOnly = true)
    public List<AnswerSheetResponse> getAnswerSheetsByExam(Long examId) {
        return answerSheetRepository.findByExamIdOrderByCreatedAtDesc(examId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AnswerSheetResponse> getAllAnswerSheets() {
        return answerSheetRepository.findAllOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AnswerSheetResponse getAnswerSheetById(Long id) {
        AnswerSheet sheet = answerSheetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Answer sheet not found with id: " + id));
        return toResponse(sheet);
    }

    @Transactional
    public AnswerSheetResponse uploadAnswerSheet(Long examId, String candidateReference, MultipartFile file) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + examId));

        String filePath = fileStorageService.storeFile(file, examId);

        AnswerSheet answerSheet = AnswerSheet.builder()
                .exam(exam)
                .candidateReference(candidateReference.trim())
                .originalFileName(file.getOriginalFilename())
                .filePath(filePath)
                .processingStatus(ProcessingStatus.UPLOADED)
                .createdAt(LocalDateTime.now())
                .build();

        answerSheet = answerSheetRepository.save(answerSheet);

        // Pre-create Answer entities for each question in the exam
        List<Question> questions = questionRepository.findByExamIdOrderByQuestionNumberAsc(examId);
        List<Answer> answers = new ArrayList<>();
        for (Question q : questions) {
            Answer ans = Answer.builder()
                    .answerSheet(answerSheet)
                    .question(q)
                    .extractedText("")
                    .ocrConfidence(0.0)
                    .build();
            answers.add(ans);
        }
        answerRepository.saveAll(answers);
        answerSheet.setAnswers(answers);

        // Automatically trigger initial OCR processing for seamless demo experience
        try {
            processOcrInternal(answerSheet);
        } catch (Exception e) {
            log.warn("Auto-OCR encountered warning during upload: {}", e.getMessage());
        }

        return toResponse(answerSheet);
    }

    @Transactional
    public AnswerSheetResponse processOcr(Long answerSheetId) {
        AnswerSheet answerSheet = answerSheetRepository.findById(answerSheetId)
                .orElseThrow(() -> new ResourceNotFoundException("Answer sheet not found: " + answerSheetId));
        return toResponse(processOcrInternal(answerSheet));
    }

    private AnswerSheet processOcrInternal(AnswerSheet answerSheet) {
        answerSheet.setProcessingStatus(ProcessingStatus.OCR_PROCESSING);
        answerSheet = answerSheetRepository.save(answerSheet);

        List<Question> questions = questionRepository.findByExamIdOrderByQuestionNumberAsc(answerSheet.getExam().getId());
        AiOcrResponse ocrResponse = aiProcessingService.processOcr(answerSheet.getFilePath(), questions.size());

        Map<Integer, ExtractedAnswerItem> extractedByQuestion = new HashMap<>();
        if (ocrResponse != null && ocrResponse.getAnswers() != null) {
            for (ExtractedAnswerItem item : ocrResponse.getAnswers()) {
                if (item.getQuestionNumber() != null) {
                    extractedByQuestion.put(item.getQuestionNumber(), item);
                }
            }
        }

        List<Answer> answers = answerRepository.findByAnswerSheetIdOrderByIdAsc(answerSheet.getId());
        for (Answer ans : answers) {
            int qNum = ans.getQuestion().getQuestionNumber();
            if (extractedByQuestion.containsKey(qNum)) {
                ExtractedAnswerItem item = extractedByQuestion.get(qNum);
                ans.setExtractedText(item.getText());
                ans.setOcrConfidence(item.getOcrConfidence());
            } else if (ans.getExtractedText() == null || ans.getExtractedText().isEmpty()) {
                ans.setExtractedText("No answer text identified for Question " + qNum);
                ans.setOcrConfidence(0.50);
            }
            answerRepository.save(ans);
        }

        answerSheet.setProcessingStatus(ProcessingStatus.OCR_COMPLETED);
        return answerSheetRepository.save(answerSheet);
    }

    @Transactional
    public AnswerSheetResponse updateExtractedText(Long answerId, String text) {
        Answer answer = answerRepository.findById(answerId)
                .orElseThrow(() -> new ResourceNotFoundException("Answer not found with id: " + answerId));

        answer.setExtractedText(text);
        answer = answerRepository.save(answer);

        return toResponse(answer.getAnswerSheet());
    }

    @Transactional
    public AnswerSheetResponse evaluateAll(Long answerSheetId) {
        AnswerSheet answerSheet = answerSheetRepository.findById(answerSheetId)
                .orElseThrow(() -> new ResourceNotFoundException("Answer sheet not found: " + answerSheetId));

        answerSheet.setProcessingStatus(ProcessingStatus.EVALUATING);
        answerSheet = answerSheetRepository.save(answerSheet);

        List<Answer> answers = answerRepository.findByAnswerSheetIdOrderByIdAsc(answerSheet.getId());
        double totalAiMarks = 0.0;

        for (Answer ans : answers) {
            Question question = ans.getQuestion();
            Rubric rubric = question.getRubric();

            String modelAnswer = rubric != null ? rubric.getModelAnswer() : "";
            String rubricCriteria = rubric != null ? rubric.getCriteria() : "";

            AiEvaluateRequest evalRequest = AiEvaluateRequest.builder()
                    .question(question.getQuestionText())
                    .maxMarks(question.getMaxMarks())
                    .modelAnswer(modelAnswer)
                    .rubric(rubricCriteria)
                    .studentAnswer(ans.getExtractedText())
                    .build();

            AiEvaluateResponse evalResponse = aiProcessingService.evaluateAnswer(evalRequest);

            Evaluation evaluation = ans.getEvaluation();
            if (evaluation == null) {
                evaluation = Evaluation.builder()
                        .answer(ans)
                        .maxMarks(question.getMaxMarks())
                        .status(EvaluationStatus.AI_SUGGESTED)
                        .build();
            }

            Double suggestedMarks = evalResponse.getSuggestedMarks();
            if (suggestedMarks > question.getMaxMarks()) suggestedMarks = question.getMaxMarks();
            if (suggestedMarks < 0.0) suggestedMarks = 0.0;

            evaluation.setAiSuggestedMarks(suggestedMarks);
            // Default examiner marks to AI suggested if not set yet, preserving examiner override capability
            if (evaluation.getExaminerMarks() == null) {
                evaluation.setExaminerMarks(suggestedMarks);
            }
            evaluation.setAiConfidence(evalResponse.getConfidence());
            evaluation.setExplanation(evalResponse.getExplanation());
            evaluation.setMatchedConcepts(String.join(", ", evalResponse.getMatchedConcepts()));
            evaluation.setMissingConcepts(String.join(", ", evalResponse.getMissingConcepts()));
            evaluation.setStatus(EvaluationStatus.AI_SUGGESTED);

            evaluation = evaluationRepository.save(evaluation);
            ans.setEvaluation(evaluation);
            totalAiMarks += suggestedMarks;

            // Quality Control checks:
            checkAndApplyQualityControlFlags(evaluation, ans);
        }

        answerSheet.setTotalAiMarks(totalAiMarks);
        answerSheet.setProcessingStatus(ProcessingStatus.EVALUATED);
        answerSheet = answerSheetRepository.save(answerSheet);

        return toResponse(answerSheet);
    }

    private void checkAndApplyQualityControlFlags(Evaluation evaluation, Answer answer) {
        String studentText = answer.getExtractedText() != null ? answer.getExtractedText().trim() : "";

        // 1. Unchecked / unanswered check
        if (studentText.isEmpty() || studentText.length() < 10) {
            createFlagIfNotExists(evaluation, ModerationFlagType.UNANSWERED_OR_EMPTY, Severity.HIGH,
                    "Student answer appears to be blank or unanswered.");
        }

        // 2. Low confidence check
        if (evaluation.getAiConfidence() != null && evaluation.getAiConfidence() < confidenceThreshold) {
            createFlagIfNotExists(evaluation, ModerationFlagType.LOW_CONFIDENCE, Severity.MEDIUM,
                    String.format("AI confidence (%.0f%%) is below the threshold of %.0f%%.",
                            evaluation.getAiConfidence() * 100, confidenceThreshold * 100));
        }

        // 3. AI vs Examiner difference check (if examiner marks are already provided)
        if (evaluation.getExaminerMarks() != null && evaluation.getAiSuggestedMarks() != null) {
            double diff = Math.abs(evaluation.getExaminerMarks() - evaluation.getAiSuggestedMarks());
            if (diff >= varianceThreshold) {
                createFlagIfNotExists(evaluation, ModerationFlagType.MARK_VARIANCE, Severity.HIGH,
                        String.format("Large mark variance detected: AI suggested %.1f, Examiner assigned %.1f (diff = %.1f)",
                                evaluation.getAiSuggestedMarks(), evaluation.getExaminerMarks(), diff));
            }
        }
    }

    private void createFlagIfNotExists(Evaluation evaluation, ModerationFlagType type, Severity severity, String reason) {
        List<ModerationFlag> existing = moderationFlagRepository.findByEvaluationId(evaluation.getId());
        boolean exists = existing.stream().anyMatch(f -> f.getFlagType() == type && !f.isResolved());
        if (!exists) {
            ModerationFlag flag = ModerationFlag.builder()
                    .evaluation(evaluation)
                    .flagType(type)
                    .severity(severity)
                    .reason(reason)
                    .resolved(false)
                    .createdAt(LocalDateTime.now())
                    .build();
            moderationFlagRepository.save(flag);
        }
    }

    @Transactional
    public EvaluationDto updateExaminerMark(Long evaluationId, Double examinerMarks, String comment) {
        Evaluation evaluation = evaluationRepository.findById(evaluationId)
                .orElseThrow(() -> new ResourceNotFoundException("Evaluation not found: " + evaluationId));

        if (examinerMarks < 0 || examinerMarks > evaluation.getMaxMarks()) {
            throw new BadRequestException("Examiner marks must be between 0 and " + evaluation.getMaxMarks());
        }

        evaluation.setExaminerMarks(examinerMarks);
        if (comment != null) {
            evaluation.setExaminerComment(comment);
        }
        evaluation.setStatus(EvaluationStatus.EXAMINER_REVIEWED);
        evaluation = evaluationRepository.save(evaluation);

        // Check for mark variance flag
        if (evaluation.getAiSuggestedMarks() != null) {
            double diff = Math.abs(evaluation.getExaminerMarks() - evaluation.getAiSuggestedMarks());
            if (diff >= varianceThreshold) {
                createFlagIfNotExists(evaluation, ModerationFlagType.MARK_VARIANCE, Severity.HIGH,
                        String.format("Mark variance alert: AI suggested %.1f, Examiner set %.1f (diff = %.1f)",
                                evaluation.getAiSuggestedMarks(), evaluation.getExaminerMarks(), diff));
            }
        }

        // Update answer sheet total final marks
        AnswerSheet sheet = evaluation.getAnswer().getAnswerSheet();
        recalculateFinalMarks(sheet);

        return toEvaluationDto(evaluation);
    }

    @Transactional
    public ModerationFlagDto flagEvaluation(Long evaluationId, FlagRequest request) {
        Evaluation evaluation = evaluationRepository.findById(evaluationId)
                .orElseThrow(() -> new ResourceNotFoundException("Evaluation not found: " + evaluationId));

        ModerationFlag flag = ModerationFlag.builder()
                .evaluation(evaluation)
                .flagType(request.getFlagType() != null ? request.getFlagType() : ModerationFlagType.MANUAL_FLAG)
                .severity(request.getSeverity() != null ? request.getSeverity() : Severity.MEDIUM)
                .reason(request.getReason())
                .resolved(false)
                .createdAt(LocalDateTime.now())
                .build();

        flag = moderationFlagRepository.save(flag);
        evaluation.setStatus(EvaluationStatus.FLAGGED);
        evaluationRepository.save(evaluation);

        return toModerationFlagDto(flag);
    }

    @Transactional
    public AnswerSheetResponse finalizeAnswerSheet(Long answerSheetId, String notes) {
        AnswerSheet answerSheet = answerSheetRepository.findById(answerSheetId)
                .orElseThrow(() -> new ResourceNotFoundException("Answer sheet not found: " + answerSheetId));

        List<Answer> answers = answerRepository.findByAnswerSheetIdOrderByIdAsc(answerSheetId);
        double totalFinal = 0.0;
        for (Answer ans : answers) {
            Evaluation eval = ans.getEvaluation();
            if (eval == null) {
                throw new BadRequestException("All questions must be evaluated before finalization.");
            }
            if (eval.getExaminerMarks() == null) {
                eval.setExaminerMarks(eval.getAiSuggestedMarks() != null ? eval.getAiSuggestedMarks() : 0.0);
            }
            eval.setStatus(EvaluationStatus.FINALIZED);
            eval.setFinalizedAt(LocalDateTime.now());
            evaluationRepository.save(eval);
            totalFinal += eval.getExaminerMarks();
        }

        answerSheet.setTotalFinalMarks(totalFinal);
        answerSheet.setProcessingStatus(ProcessingStatus.FINALIZED);
        answerSheet.setFinalizedAt(LocalDateTime.now());
        if (notes != null && !notes.trim().isEmpty()) {
            answerSheet.setExaminerNotes(notes);
        }

        answerSheet = answerSheetRepository.save(answerSheet);
        return toResponse(answerSheet);
    }

    @Transactional(readOnly = true)
    public ResultSummaryDto getSummary(Long answerSheetId) {
        AnswerSheet sheet = answerSheetRepository.findById(answerSheetId)
                .orElseThrow(() -> new ResourceNotFoundException("Answer sheet not found: " + answerSheetId));

        List<Answer> answers = answerRepository.findByAnswerSheetIdOrderByIdAsc(answerSheetId);

        List<ResultSummaryDto.QuestionSummaryItem> items = new ArrayList<>();
        double totalFinal = 0.0;
        double totalAi = 0.0;
        double totalMax = 0.0;
        boolean hasUnresolvedFlags = false;

        for (Answer ans : answers) {
            Question q = ans.getQuestion();
            Evaluation eval = ans.getEvaluation();

            Double finalMarks = eval != null && eval.getExaminerMarks() != null ? eval.getExaminerMarks() : 0.0;
            Double aiMarks = eval != null && eval.getAiSuggestedMarks() != null ? eval.getAiSuggestedMarks() : 0.0;
            Double confidence = eval != null ? eval.getAiConfidence() : 0.0;

            totalFinal += finalMarks;
            totalAi += aiMarks;
            totalMax += q.getMaxMarks();

            if (eval != null && eval.getModerationFlags() != null) {
                if (eval.getModerationFlags().stream().anyMatch(f -> !f.isResolved())) {
                    hasUnresolvedFlags = true;
                }
            }

            items.add(ResultSummaryDto.QuestionSummaryItem.builder()
                    .questionNumber(q.getQuestionNumber())
                    .questionText(q.getQuestionText())
                    .maxMarks(q.getMaxMarks())
                    .aiSuggestedMarks(aiMarks)
                    .finalExaminerMarks(finalMarks)
                    .confidence(confidence)
                    .explanation(eval != null ? eval.getExplanation() : "")
                    .examinerComment(eval != null ? eval.getExaminerComment() : "")
                    .build());
        }

        double percentage = totalMax > 0 ? (totalFinal / totalMax) * 100.0 : 0.0;
        String grade = getGradeFromPercentage(percentage);

        String moderationStatus = hasUnresolvedFlags ? "Pending Moderation Review" : "Approved & Verified";

        return ResultSummaryDto.builder()
                .answerSheetId(sheet.getId())
                .candidateReference(sheet.getCandidateReference())
                .examTitle(sheet.getExam().getTitle())
                .subjectName(sheet.getExam().getSubject().getName())
                .subjectCode(sheet.getExam().getSubject().getCode())
                .totalFinalMarks(totalFinal)
                .totalAiMarks(totalAi)
                .totalMaxMarks(totalMax)
                .percentage(Math.round(percentage * 10.0) / 10.0)
                .grade(grade)
                .moderationStatus(moderationStatus)
                .finalizedAt(sheet.getFinalizedAt())
                .questionSummaries(items)
                .build();
    }

    private String getGradeFromPercentage(double pct) {
        if (pct >= 85) return "A+";
        if (pct >= 75) return "A";
        if (pct >= 65) return "B+";
        if (pct >= 55) return "B";
        if (pct >= 45) return "C";
        if (pct >= 35) return "D (Pass)";
        return "F (Fail)";
    }

    private void recalculateFinalMarks(AnswerSheet sheet) {
        List<Answer> answers = answerRepository.findByAnswerSheetIdOrderByIdAsc(sheet.getId());
        double total = 0.0;
        for (Answer ans : answers) {
            if (ans.getEvaluation() != null && ans.getEvaluation().getExaminerMarks() != null) {
                total += ans.getEvaluation().getExaminerMarks();
            }
        }
        sheet.setTotalFinalMarks(total);
        answerSheetRepository.save(sheet);
    }

    public AnswerSheetResponse toResponse(AnswerSheet sheet) {
        List<Answer> answers = answerRepository.findByAnswerSheetIdOrderByIdAsc(sheet.getId());
        List<AnswerDto> answerDtos = answers.stream().map(this::toAnswerDto).collect(Collectors.toList());

        double totalMax = answers.stream().mapToDouble(a -> a.getQuestion().getMaxMarks()).sum();

        int flagCount = 0;
        for (Answer a : answers) {
            if (a.getEvaluation() != null && a.getEvaluation().getModerationFlags() != null) {
                flagCount += a.getEvaluation().getModerationFlags().stream().filter(f -> !f.isResolved()).count();
            }
        }

        return AnswerSheetResponse.builder()
                .id(sheet.getId())
                .examId(sheet.getExam().getId())
                .examTitle(sheet.getExam().getTitle())
                .subjectName(sheet.getExam().getSubject().getName())
                .candidateReference(sheet.getCandidateReference())
                .originalFileName(sheet.getOriginalFileName())
                .fileUrl("/api/files/" + sheet.getId())
                .processingStatus(sheet.getProcessingStatus())
                .totalFinalMarks(sheet.getTotalFinalMarks())
                .totalAiMarks(sheet.getTotalAiMarks())
                .totalMaxMarks(totalMax)
                .examinerNotes(sheet.getExaminerNotes())
                .createdAt(sheet.getCreatedAt())
                .finalizedAt(sheet.getFinalizedAt())
                .answers(answerDtos)
                .flagCount(flagCount)
                .build();
    }

    public AnswerDto toAnswerDto(Answer answer) {
        Question q = answer.getQuestion();
        RubricDto rubricDto = null;
        if (q.getRubric() != null) {
            rubricDto = RubricDto.builder()
                    .id(q.getRubric().getId())
                    .modelAnswer(q.getRubric().getModelAnswer())
                    .criteria(q.getRubric().getCriteria())
                    .keywords(q.getRubric().getKeywords())
                    .build();
        }

        EvaluationDto evaluationDto = null;
        if (answer.getEvaluation() != null) {
            evaluationDto = toEvaluationDto(answer.getEvaluation());
        }

        return AnswerDto.builder()
                .id(answer.getId())
                .questionId(q.getId())
                .questionNumber(q.getQuestionNumber())
                .questionText(q.getQuestionText())
                .maxMarks(q.getMaxMarks())
                .rubric(rubricDto)
                .extractedText(answer.getExtractedText())
                .ocrConfidence(answer.getOcrConfidence())
                .evaluation(evaluationDto)
                .build();
    }

    public EvaluationDto toEvaluationDto(Evaluation eval) {
        List<String> matched = parseList(eval.getMatchedConcepts());
        List<String> missing = parseList(eval.getMissingConcepts());

        List<ModerationFlagDto> flags = new ArrayList<>();
        if (eval.getModerationFlags() != null) {
            flags = eval.getModerationFlags().stream()
                    .map(this::toModerationFlagDto)
                    .collect(Collectors.toList());
        }

        return EvaluationDto.builder()
                .id(eval.getId())
                .answerId(eval.getAnswer() != null ? eval.getAnswer().getId() : null)
                .aiSuggestedMarks(eval.getAiSuggestedMarks())
                .examinerMarks(eval.getExaminerMarks())
                .maxMarks(eval.getMaxMarks())
                .aiConfidence(eval.getAiConfidence())
                .explanation(eval.getExplanation())
                .matchedConcepts(matched)
                .missingConcepts(missing)
                .examinerComment(eval.getExaminerComment())
                .status(eval.getStatus())
                .finalizedAt(eval.getFinalizedAt())
                .moderationFlags(flags)
                .build();
    }

    public ModerationFlagDto toModerationFlagDto(ModerationFlag flag) {
        Evaluation eval = flag.getEvaluation();
        Answer ans = eval != null ? eval.getAnswer() : null;
        Question q = ans != null ? ans.getQuestion() : null;
        AnswerSheet sheet = ans != null ? ans.getAnswerSheet() : null;

        return ModerationFlagDto.builder()
                .id(flag.getId())
                .evaluationId(eval != null ? eval.getId() : null)
                .answerSheetId(sheet != null ? sheet.getId() : null)
                .candidateReference(sheet != null ? sheet.getCandidateReference() : "N/A")
                .examTitle(sheet != null && sheet.getExam() != null ? sheet.getExam().getTitle() : "N/A")
                .questionNumber(q != null ? q.getQuestionNumber() : null)
                .flagType(flag.getFlagType())
                .severity(flag.getSeverity())
                .reason(flag.getReason())
                .resolved(flag.isResolved())
                .resolutionComment(flag.getResolutionComment())
                .createdAt(flag.getCreatedAt())
                .aiMarks(eval != null ? eval.getAiSuggestedMarks() : null)
                .examinerMarks(eval != null ? eval.getExaminerMarks() : null)
                .confidence(eval != null ? eval.getAiConfidence() : null)
                .build();
    }

    private List<String> parseList(String raw) {
        if (raw == null || raw.trim().isEmpty()) {
            return new ArrayList<>();
        }
        return Arrays.stream(raw.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }
}
