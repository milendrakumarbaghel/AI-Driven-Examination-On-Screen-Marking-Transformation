package org.springboot.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springboot.backend.dto.evaluation.EvaluationDto;
import org.springboot.backend.entity.Answer;
import org.springboot.backend.entity.AnswerSheet;
import org.springboot.backend.entity.Evaluation;
import org.springboot.backend.entity.Question;
import org.springboot.backend.entity.enums.EvaluationStatus;
import org.springboot.backend.entity.enums.ProcessingStatus;
import org.springboot.backend.exception.BadRequestException;
import org.springboot.backend.repository.AnswerRepository;
import org.springboot.backend.repository.AnswerSheetRepository;
import org.springboot.backend.repository.EvaluationRepository;
import org.springboot.backend.repository.ModerationFlagRepository;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AnswerSheetServiceTest {

    @Mock
    private AnswerSheetRepository answerSheetRepository;

    @Mock
    private EvaluationRepository evaluationRepository;

    @Mock
    private AnswerRepository answerRepository;

    @Mock
    private ModerationFlagRepository moderationFlagRepository;

    @Mock
    private AiProcessingService aiProcessingService;

    @InjectMocks
    private AnswerSheetService answerSheetService;

    private Evaluation evaluation;
    private Answer answer;
    private AnswerSheet answerSheet;
    private Question question;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(answerSheetService, "varianceThreshold", 3.0);
        ReflectionTestUtils.setField(answerSheetService, "confidenceThreshold", 0.70);

        question = Question.builder()
                .id(1L)
                .questionNumber(1)
                .questionText("Explain Inheritance in Java")
                .maxMarks(10.0)
                .build();

        answerSheet = AnswerSheet.builder()
                .id(100L)
                .candidateReference("CAND-001")
                .processingStatus(ProcessingStatus.EVALUATED)
                .build();

        answer = Answer.builder()
                .id(10L)
                .answerSheet(answerSheet)
                .question(question)
                .extractedText("Inheritance is an OOP mechanism...")
                .build();

        evaluation = Evaluation.builder()
                .id(50L)
                .answer(answer)
                .maxMarks(10.0)
                .aiSuggestedMarks(8.0)
                .examinerMarks(8.0)
                .aiConfidence(0.85)
                .status(EvaluationStatus.AI_SUGGESTED)
                .build();

        answer.setEvaluation(evaluation);
    }

    @Test
    void testUpdateExaminerMark_ValidMark() {
        when(evaluationRepository.findById(50L)).thenReturn(Optional.of(evaluation));
        when(evaluationRepository.save(any(Evaluation.class))).thenAnswer(i -> i.getArgument(0));
        when(answerRepository.findByAnswerSheetIdOrderByIdAsc(100L)).thenReturn(Collections.singletonList(answer));

        EvaluationDto result = answerSheetService.updateExaminerMark(50L, 9.0, "Great answer, added 1 mark for clarity");

        assertNotNull(result);
        assertEquals(9.0, result.getExaminerMarks());
        assertEquals(EvaluationStatus.EXAMINER_REVIEWED, result.getStatus());
        verify(evaluationRepository, times(1)).save(any(Evaluation.class));
    }

    @Test
    void testUpdateExaminerMark_ExceedsMaxMarks_ThrowsBadRequest() {
        when(evaluationRepository.findById(50L)).thenReturn(Optional.of(evaluation));

        assertThrows(BadRequestException.class, () -> {
            answerSheetService.updateExaminerMark(50L, 12.0, "Invalid score");
        });

        verify(evaluationRepository, never()).save(any(Evaluation.class));
    }

    @Test
    void testUpdateExaminerMark_NegativeMark_ThrowsBadRequest() {
        when(evaluationRepository.findById(50L)).thenReturn(Optional.of(evaluation));

        assertThrows(BadRequestException.class, () -> {
            answerSheetService.updateExaminerMark(50L, -2.0, "Negative score");
        });

        verify(evaluationRepository, never()).save(any(Evaluation.class));
    }

    @Test
    void testUpdateExaminerMark_TriggersVarianceFlag() {
        when(evaluationRepository.findById(50L)).thenReturn(Optional.of(evaluation));
        when(evaluationRepository.save(any(Evaluation.class))).thenAnswer(i -> i.getArgument(0));
        when(answerRepository.findByAnswerSheetIdOrderByIdAsc(100L)).thenReturn(Collections.singletonList(answer));
        when(moderationFlagRepository.findByEvaluationId(50L)).thenReturn(Collections.emptyList());

        // AI suggested is 8.0, setting to 4.0 (diff = 4.0 >= 3.0 variance threshold)
        EvaluationDto result = answerSheetService.updateExaminerMark(50L, 4.0, "Significantly penalized for missed concept");

        assertNotNull(result);
        assertEquals(4.0, result.getExaminerMarks());
        // Verify moderation flag is created
        verify(moderationFlagRepository, times(1)).save(any());
    }
}
