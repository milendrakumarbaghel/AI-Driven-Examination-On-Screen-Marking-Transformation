package org.springboot.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "rubrics")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Rubric {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    @JsonIgnore
    private Question question;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String modelAnswer;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String criteria;

    @Column(columnDefinition = "TEXT")
    private String keywords;
}
