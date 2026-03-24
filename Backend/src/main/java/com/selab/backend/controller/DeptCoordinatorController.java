package com.selab.backend.controller;

import com.selab.backend.Dto.ApplicationDto;
import com.selab.backend.models.ProjectApplications;
import com.selab.backend.models.User;
import com.selab.backend.services.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
 @RequestMapping("/api/deptCoordinators")
@RequiredArgsConstructor
public class DeptCoordinatorController {
    private final ApplicationService applicationService;

    @GetMapping("/final")
    public ResponseEntity<List<ApplicationDto>> getFinal(@AuthenticationPrincipal User user){
        return new ResponseEntity<>(applicationService.getFinal(user), HttpStatus.OK);
    }
}
