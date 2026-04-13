package com.selab.backend.controller;

import com.selab.backend.Dto.ProfessorApplicationDto;
import com.selab.backend.models.Professor;
import com.selab.backend.models.User;
import com.selab.backend.repositories.ProfessorRepository;
import com.selab.backend.services.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/professor")
@RequiredArgsConstructor
public class ProfessorApplicationController {




}