package org.springboot.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.springboot.backend.entity.enums.EvaluationStatus;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "evaluations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Evaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "answer_id", nullable = false)
    @JsonIgnore
    private Answer answer;

    private Double aiSuggestedMarks;

    private Double examinerMarks;

    @Column(nullable = false)
    private Double maxMarks;

    private Double aiConfidence;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    @Column(columnDefinition = "TEXT")
    private String matchedConcepts;

    @Column(columnDefinition = "TEXT")
    private String missingConcepts;

    @Column(columnDefinition = "TEXT")
    private String examinerComment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private EvaluationStatus status = EvaluationStatus.PENDING;

    private LocalDateTime finalizedAt;

    @OneToMany(mappedBy = "evaluation", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("evaluation")
    @Builder.Default
    private List<ModerationFlag> moderationFlags = new ArrayList<>();
}
