package com.example.demo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "quiz_results")
public class QuizResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    private Integer score;
    private Integer totalQuestions;
    private LocalDateTime completedAt;

    public QuizResult() {}

    public QuizResult(Student student, Quiz quiz, Integer score, Integer totalQuestions) {
        this.student = student;
        this.quiz = quiz;
        this.score = score;
        this.totalQuestions = totalQuestions;
        this.completedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public Student getStudent() { return student; }
    public Quiz getQuiz() { return quiz; }
    public Integer getScore() { return score; }
    public Integer getTotalQuestions() { return totalQuestions; }
    public LocalDateTime getCompletedAt() { return completedAt; }
}
