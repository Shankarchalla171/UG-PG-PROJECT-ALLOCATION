package com.selab.backend.controller;

import com.selab.backend.Dto.CollaborationDto;
import com.selab.backend.Dto.CollaborationRequest;
import com.selab.backend.models.User;
import com.selab.backend.services.CollaborationService;
import lombok.RequiredArgsConstructor;
import org.springframework.expression.spel.ast.BooleanLiteral;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/collaborations")
@RequiredArgsConstructor
public class CollaborationController {
    private final CollaborationService collaborationService;

    @PostMapping()
    public ResponseEntity<?> SendInvitation(@AuthenticationPrincipal User user, @RequestParam CollaborationRequest request){
        collaborationService.invite(user,request);
        return ResponseEntity.ok().body("Invitation sent successfully");
    }

    @GetMapping("")
    public ResponseEntity<List<CollaborationDto>> getAll(@AuthenticationPrincipal  User user,@RequestParam Boolean sent){
        return new ResponseEntity<>(collaborationService.getAll(user,sent), HttpStatus.OK);
    }

    @PutMapping("/{collaborationId}")
    public ResponseEntity<?> response(@AuthenticationPrincipal User user,@PathVariable Long collaborationId, @RequestParam Boolean accept ){
        collaborationService.response(user,collaborationId,accept);
        return ResponseEntity.ok().body(accept ? "Accepted Successfully" : "Rejected Successfully");
    }
}
