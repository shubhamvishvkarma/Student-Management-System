package com.example.demo.controller;

import com.example.demo.model.Student;
import com.example.demo.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.mindrot.jbcrypt.BCrypt;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "*")
public class StudentController {

    @Autowired
    private StudentRepository studentRepository;

    // Get all students
    @GetMapping
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    // Create a new student
    @PostMapping
    public Student createStudent(@RequestBody Student student) {
        return studentRepository.save(student);
    }

    // Get student by id
    @GetMapping("/{id}")
    public ResponseEntity<Student> getStudentById(@PathVariable Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not exist with id :" + id));
        return ResponseEntity.ok(student);
    }

    // Update student
    @PutMapping("/{id}")
    public ResponseEntity<Student> updateStudent(@PathVariable Long id, @RequestBody Student studentDetails) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not exist with id :" + id));

        student.setFirstName(studentDetails.getFirstName());
        student.setLastName(studentDetails.getLastName());
        student.setEmail(studentDetails.getEmail());
        student.setDepartment(studentDetails.getDepartment());
        if (studentDetails.getRollNumber() != null) student.setRollNumber(studentDetails.getRollNumber());
        if (studentDetails.getPhoneNumber() != null) student.setPhoneNumber(studentDetails.getPhoneNumber());
        if (studentDetails.getEnrollmentYear() != null) student.setEnrollmentYear(studentDetails.getEnrollmentYear());
        if (studentDetails.getCgpa() != null) student.setCgpa(studentDetails.getCgpa());

        Student updatedStudent = studentRepository.save(student);
        return ResponseEntity.ok(updatedStudent);
    }

    // Update password
    @PutMapping("/{id}/password")
    public ResponseEntity<?> updatePassword(@PathVariable Long id, @RequestBody Map<String, String> passwords) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not exist with id :" + id));

        String currentPassword = passwords.get("currentPassword");
        String newPassword = passwords.get("newPassword");

        if (!BCrypt.checkpw(currentPassword, student.getPassword())) {
            return ResponseEntity.badRequest().body("Incorrect current password!");
        }

        student.setPassword(BCrypt.hashpw(newPassword, BCrypt.gensalt(10)));
        studentRepository.save(student);
        
        return ResponseEntity.ok("Password updated successfully");
    }

    // Delete student
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not exist with id :" + id));

        studentRepository.delete(student);
        return ResponseEntity.noContent().build();
    }
}
