package com.selab.backend.controller;


import com.selab.backend.models.Professor;
import lombok.RequiredArgsConstructor;
import org.apache.coyote.Response;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/professors")
@RequiredArgsConstructor
public class ProfessorController {


    @GetMapping("/profile")
    public ResponseEntity<Professor> getProfessor(@RequestParam String email) {
        return ResponseEntity.ok();
    }



}
