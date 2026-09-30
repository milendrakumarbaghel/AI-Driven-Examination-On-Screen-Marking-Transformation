package org.springboot.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.springboot.backend.entity.enums.ProcessingStatus;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "answer_sheets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnswerSheet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "exam_id", nullable = false)
    private Exam exam;

    @Column(nullable = false)
    private String candidateReference;

    @Column(nullable = false)
    private String originalFileName;

    @Column(nullable = false)
    private String filePath;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ProcessingStatus processingStatus = ProcessingStatus.UPLOADED;

    private Double totalFinalMarks;

    private Double totalAiMarks;

    @Column(columnDefinition = "TEXT")
    private String examinerNotes;

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime finalizedAt;

    @OneToMany(mappedBy = "answerSheet", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("answerSheet")
    @OrderBy("id ASC")
    @Builder.Default
    private List<Answer> answers = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
