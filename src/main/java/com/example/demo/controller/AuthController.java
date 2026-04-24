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
        // Validate required fields
        if (request.getFirstName() == null || request.getFirstName().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse("First name is required!"));
        }
        if (request.getLastName() == null || request.getLastName().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse("Last name is required!"));
        }
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse("Email is required!"));
        }
        
        // Validate email format
        if (!isValidEmail(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse("Invalid email format!"));
        }
        
        if (request.getDepartment() == null || request.getDepartment().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse("Department is required!"));
        }
        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse("Password is required!"));
        }
        
        // Validate password length
        if (request.getPassword().length() < 6) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse("Password must be at least 6 characters!"));
        }
        
        if (request.getRollNumber() == null || request.getRollNumber().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse("Roll number is required!"));
        }
        if (request.getEnrollmentYear() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse("Enrollment year is required!"));
        }

        // Check if email already exists (case-insensitive)
        if (studentRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse("Email is already registered!"));
        }

        // Check if roll number already exists
        if (studentRepository.findByRollNumber(request.getRollNumber()).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse("Roll number is already registered!"));
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

        try {
            studentRepository.save(newStudent);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponse("Registration failed due to server error!"));
        }

        Map<String, String> response = new HashMap<>();
        response.put("message", "Registration successful!");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        // Validate required fields
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse("Email is required!"));
        }
        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse("Password is required!"));
        }
        
        Optional<Student> studentOpt = studentRepository.findByEmail(request.getEmail());

        if (studentOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse("Invalid email or password!"));
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
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse("Invalid email or password!"));
        }
    }
    
    // Helper method to validate email format
    private boolean isValidEmail(String email) {
        String emailRegex = "^[A-Za-z0-9+_.-]+@(.+)$";
        return email.matches(emailRegex);
    }
    
    // Inner class for consistent error responses
    public static class ErrorResponse {
        public String message;
        
        public ErrorResponse(String message) {
            this.message = message;
        }
        
        public String getMessage() {
            return message;
        }
    }
}
