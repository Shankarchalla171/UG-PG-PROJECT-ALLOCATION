package com.selab.backend.controller;

import com.selab.backend.Dto.ApplicationDto;
import com.selab.backend.Dto.LimitsDto;
import com.selab.backend.Dto.SetLimitRequest;
import com.selab.backend.models.ProjectApplications;
import com.selab.backend.models.User;
import com.selab.backend.services.ApplicationService;
import com.selab.backend.services.DeptCoordinatorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.selab.backend.Dto.DeptCoordinatorDashboardStatsDto;

import java.util.List;

@RestController
@RequestMapping("/api/deptCoordinators")
@RequiredArgsConstructor
public class DeptCoordinatorController {
    private final ApplicationService applicationService;
    private final DeptCoordinatorService deptCoordinatorService;
    @GetMapping("/final")
    public ResponseEntity<List<ApplicationDto>> getFinal(@AuthenticationPrincipal User user){
        return new ResponseEntity<>(applicationService.getFinal(user), HttpStatus.OK);
    }

    @PutMapping("/faculty-intake-limit")
    public ResponseEntity<?> setFacultyLimit(@AuthenticationPrincipal User user, @RequestBody @Valid SetLimitRequest request) {
        deptCoordinatorService.setFacultyLimit(user,request.getLimit());
        return  ResponseEntity.ok().body("faculty student intake limit set successfully..");
    }

    @PutMapping("/student-teamsize-limit")
    public ResponseEntity<?> setStudentTeamLimit(@AuthenticationPrincipal User user,@Valid @RequestBody SetLimitRequest request){
        deptCoordinatorService.setStudentTeamLimit(user,request.getLimit());
        return ResponseEntity.ok().body("student team size limit set successfully ..");
    }

    @GetMapping("/limits")
    public ResponseEntity<LimitsDto> getLimits(@AuthenticationPrincipal User user){

        return new ResponseEntity<>( deptCoordinatorService.getLimits(user),HttpStatus.OK);
    }



    @GetMapping("/dashboard/stats")
    public ResponseEntity<DeptCoordinatorDashboardStatsDto> getDashboardStats(
            @AuthenticationPrincipal User user) {
        DeptCoordinatorDashboardStatsDto stats = deptCoordinatorService.getDashboardStats(user);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/dashboard/stats/all-batches")
    public ResponseEntity<DeptCoordinatorDashboardStatsDto> getAllBatchesStats(
            @AuthenticationPrincipal User user) {
        DeptCoordinatorDashboardStatsDto stats = deptCoordinatorService.getAllBatchesStats(user);
        return ResponseEntity.ok(stats);
    }
}
