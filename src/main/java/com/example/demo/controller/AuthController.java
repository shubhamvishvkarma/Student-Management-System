package com.example.demo.controller;

import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.RegisterRequest;
import com.example.demo.model.Student;
import com.example.demo.repository.StudentRepository;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private StudentRepository studentRepository;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        // Check if email already exists
        if (studentRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email is already registered!");
        }

        // Hash the password
        String hashedPassword = BCrypt.hashpw(request.getPassword(), BCrypt.gensalt(10));

        // Create new Student
        Student newStudent = new Student(
                request.getFirstName(),
                request.getLastName(),
                request.getEmail(),
                request.getDepartment(),
                hashedPassword,
                request.getRollNumber(),
                request.getPhoneNumber(),
                request.getEnrollmentYear(),
                request.getCgpa()
        );

        studentRepository.save(newStudent);

        return ResponseEntity.ok("Registration successful!");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Optional<Student> studentOpt = studentRepository.findByEmail(request.getEmail());

        if (studentOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password!");
        }

        Student student = studentOpt.get();

        // Check password
        if (BCrypt.checkpw(request.getPassword(), student.getPassword())) {
            // Success! Return user details (excluding password)
            Map<String, Object> response = new HashMap<>();
            response.put("id", student.getId());
            response.put("firstName", student.getFirstName());
            response.put("lastName", student.getLastName());
            response.put("email", student.getEmail());
            response.put("department", student.getDepartment());
            response.put("rollNumber", student.getRollNumber());
            response.put("phoneNumber", student.getPhoneNumber());
            response.put("enrollmentYear", student.getEnrollmentYear());
            response.put("cgpa", student.getCgpa());
            response.put("message", "Login successful");
            
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password!");
        }
    }
}
