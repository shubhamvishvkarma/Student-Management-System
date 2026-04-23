package com.example.demo.controller;

import com.example.demo.model.*;
import com.example.demo.repository.*;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/quizzes")
@CrossOrigin(origins = "*")
public class QuizController {

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private QuizResultRepository quizResultRepository;

    @Autowired
    private StudentRepository studentRepository;

    @PostConstruct
    public void initData() {
        if (quizRepository.count() == 0) {
            Quiz javaQuiz = new Quiz("Java Basics", "Test your knowledge of Java fundamentals.");
            quizRepository.save(javaQuiz);

            List<Question> questions = new ArrayList<>();
            questions.add(createQuestion(javaQuiz, "What is the size of int in Java?", "16-bit", "32-bit", "64-bit", "Depends on OS", "B"));
            questions.add(createQuestion(javaQuiz, "Which keyword is used to create a class in Java?", "class", "Class", "new", "struct", "A"));
            questions.add(createQuestion(javaQuiz, "What is the default value of a boolean variable?", "true", "false", "null", "0", "B"));
            questions.add(createQuestion(javaQuiz, "Which of these is not a Java feature?", "Object Oriented", "Use of pointers", "Portable", "Dynamic", "B"));
            questions.add(createQuestion(javaQuiz, "What is the return type of the hashCode() method in the Object class?", "int", "long", "void", "String", "A"));
            
            questionRepository.saveAll(questions);

            Quiz dbQuiz = new Quiz("Database Management", "SQL and Database design concepts.");
            quizRepository.save(dbQuiz);
            
            List<Question> dbQuestions = new ArrayList<>();
            dbQuestions.add(createQuestion(dbQuiz, "What does SQL stand for?", "Structured Query Language", "Simple Query Language", "Strong Query Language", "System Query Language", "A"));
            dbQuestions.add(createQuestion(dbQuiz, "Which command is used to remove all records from a table?", "DELETE", "DROP", "TRUNCATE", "REMOVE", "C"));
            
            questionRepository.saveAll(dbQuestions);

            Quiz webQuiz = new Quiz("Web Development", "HTML, CSS, and JS fundamentals.");
            quizRepository.save(webQuiz);
            List<Question> webQuestions = new ArrayList<>();
            webQuestions.add(createQuestion(webQuiz, "What does HTML stand for?", "Hyper Text Markup Language", "High Tech Modern Language", "Hyper Tabular Main Language", "None of these", "A"));
            webQuestions.add(createQuestion(webQuiz, "Which CSS property controls the text size?", "font-style", "text-size", "font-size", "text-style", "C"));
            questionRepository.saveAll(webQuestions);
        }
    }

    private Question createQuestion(Quiz quiz, String text, String a, String b, String c, String d, String correct) {
        Question q = new Question();
        q.setQuiz(quiz);
        q.setQuestionText(text);
        q.setOptionA(a);
        q.setOptionB(b);
        q.setOptionC(c);
        q.setOptionD(d);
        q.setCorrectOption(correct);
        return q;
    }

    @GetMapping
    public List<Quiz> getAllQuizzes() {
        return quizRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Quiz> getQuizById(@PathVariable Long id) {
        return quizRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/questions")
    public List<Question> getQuestionsForQuiz(@PathVariable Long id) {
        return questionRepository.findByQuizId(id);
    }

    @PostMapping("/submit")
    public ResponseEntity<?> submitQuiz(@RequestBody QuizSubmission submission) {
        Optional<Student> studentOpt = studentRepository.findById(submission.getStudentId());
        Optional<Quiz> quizOpt = quizRepository.findById(submission.getQuizId());

        if (studentOpt.isEmpty() || quizOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid student or quiz ID");
        }

        List<Question> questions = questionRepository.findByQuizId(submission.getQuizId());
        int score = 0;
        Map<Long, String> answers = submission.getAnswers();

        for (Question q : questions) {
            String submittedAnswer = answers.get(q.getId());
            if (q.getCorrectOption().equals(submittedAnswer)) {
                score++;
            }
        }

        QuizResult result = new QuizResult(studentOpt.get(), quizOpt.get(), score, questions.size());
        quizResultRepository.save(result);

        Map<String, Object> response = new HashMap<>();
        response.put("score", score);
        response.put("total", questions.size());
        response.put("percentage", (double) score / questions.size() * 100);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/results/{studentId}")
    public List<QuizResult> getResultsForStudent(@PathVariable Long studentId) {
        return quizResultRepository.findByStudentId(studentId);
    }

    @GetMapping("/leaderboard")
    public List<Map<String, Object>> getLeaderboard() {
        List<QuizResult> allResults = quizResultRepository.findAll();
        // Sort by score (descending) and take top 10
        return allResults.stream()
                .sorted((a, b) -> b.getScore().compareTo(a.getScore()))
                .limit(10)
                .map(r -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("studentName", r.getStudent().getFirstName() + " " + r.getStudent().getLastName());
                    map.put("quizTitle", r.getQuiz().getTitle());
                    map.put("score", r.getScore());
                    map.put("total", r.getTotalQuestions());
                    map.put("date", r.getCompletedAt());
                    return map;
                })
                .toList();
    }

    public static class QuizSubmission {
        private Long studentId;
        private Long quizId;
        private Map<Long, String> answers; // Question ID -> Selected Option ('A', 'B', etc.)

        public Long getStudentId() { return studentId; }
        public void setStudentId(Long studentId) { this.studentId = studentId; }
        public Long getQuizId() { return quizId; }
        public void setQuizId(Long quizId) { this.quizId = quizId; }
        public Map<Long, String> getAnswers() { return answers; }
        public void setAnswers(Map<Long, String> answers) { this.answers = answers; }
    }
}
