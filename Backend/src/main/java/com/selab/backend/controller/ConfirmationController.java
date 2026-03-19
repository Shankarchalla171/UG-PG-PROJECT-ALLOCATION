package com.selab.backend.controller;

import com.selab.backend.Dto.ViewConfirmationsDto;
import com.selab.backend.services.ConfirmationService;
import com.selab.backend.models.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.util.List;

@RestController
@RequestMapping("/api/confirmations")
@RequiredArgsConstructor
public class ConfirmationController {

    private final ConfirmationService confirmationService;

    /**
     * Get all CONFIRMED applications for the team of logged-in student
     * Only team members can view, but only team lead can confirm/reject
     */
    @GetMapping
    public ResponseEntity<List<ViewConfirmationsDto>> getConfirmations(
            @AuthenticationPrincipal User currentUser) {

        List<ViewConfirmationsDto> confirmations =
                confirmationService.getConfirmationsForTeam(currentUser);

        return ResponseEntity.ok(confirmations);
    }

    /**
     * Team lead confirms an application
     * This will:
     * - Reduce faculty slots by team size
     * - Update application status to TEAM_CONFIRMED
     * - Auto-reject other CONFIRMED applications for this team
     */
    @PostMapping("/{applicationId}/confirm")
    public ResponseEntity<Void> confirmApplication(
            @PathVariable Long applicationId,
            @AuthenticationPrincipal User currentUser) {

        confirmationService.confirmApplication(applicationId, currentUser);
        return ResponseEntity.ok().build();
    }

    /**
     * Team lead rejects an application
     * Updates application status to TEAM_REJECTED
     */
    @PostMapping("/{applicationId}/reject")
    public ResponseEntity<Void> rejectApplication(
            @PathVariable Long applicationId,
            @AuthenticationPrincipal User currentUser) {

        confirmationService.rejectApplication(applicationId, currentUser);
        return ResponseEntity.ok().build();
    }
}