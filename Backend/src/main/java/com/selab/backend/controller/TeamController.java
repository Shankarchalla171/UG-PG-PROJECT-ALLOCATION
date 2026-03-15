package com.selab.backend.controller;

import com.selab.backend.Dto.TeamDto;
import com.selab.backend.models.Team;
import com.selab.backend.models.User;
import com.selab.backend.services.TeamService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
public class TeamController {
    private final TeamService teamService;

    @PostMapping("")
    public  ResponseEntity<TeamDto> createTeam(@AuthenticationPrincipal User user){
        return new ResponseEntity<>(teamService.create(user), HttpStatus.CREATED);
    }

    @GetMapping("")
    public ResponseEntity<TeamDto> getTeam(@AuthenticationPrincipal User user){
        return new ResponseEntity<>(teamService.getTeam(user),HttpStatus.OK);
    }

    @PostMapping("/{teamId}")
    public ResponseEntity<TeamDto> joinTeams(@AuthenticationPrincipal User user, @PathVariable String teamId){
        return new ResponseEntity<>(teamService.join(user,UUID.fromString(teamId)),HttpStatus.OK);
    }

    @DeleteMapping("/leave")
    public ResponseEntity<?> leaveTeam(@AuthenticationPrincipal User user){
        System.out.println("the has reached the leave controller");
        teamService.leaveTeam(user);
        return ResponseEntity.ok().body("you left the Team Succesfully");
    }

    @PutMapping("/transfer-leadership/{newLeadId}")
    public ResponseEntity<TeamDto> transferLead(@PathVariable Long newLeadId,@AuthenticationPrincipal  User user){
        return new ResponseEntity<>(teamService.transferLead(user,newLeadId),HttpStatus.OK);
    }

    @PutMapping("/finalize/{teamId}")
    public ResponseEntity<?> finaliseTeam(@AuthenticationPrincipal User user,@PathVariable UUID teamId){
        System.out.println("reached controller");
        teamService.finalise(user,teamId);
        return ResponseEntity.ok().body("Team finalised successfully ! you can now apply for projects after the team formation deadline ends.");
    }
}
