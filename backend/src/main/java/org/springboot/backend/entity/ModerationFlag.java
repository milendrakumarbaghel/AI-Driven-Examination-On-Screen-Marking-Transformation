package org.springboot.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.springboot.backend.entity.enums.ModerationFlagType;
import org.springboot.backend.entity.enums.Severity;

import java.time.LocalDateTime;

@Entity
@Table(name = "moderation_flags")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ModerationFlag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evaluation_id", nullable = false)
    @JsonIgnore
    private Evaluation evaluation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ModerationFlagType flagType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Severity severity = Severity.MEDIUM;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String reason;

    @Column(nullable = false)
    @Builder.Default
    private boolean resolved = false;

    @Column(columnDefinition = "TEXT")
    private String resolutionComment;

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
