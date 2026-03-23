package com.selab.backend.controller;

import com.selab.backend.Dto.CreateDeadLineRequest;
import com.selab.backend.Dto.DeadLineDto;
import com.selab.backend.Dto.RemainderEmail;
import com.selab.backend.mappers.DeadLineMapper;
import com.selab.backend.models.Event;
import com.selab.backend.models.User;
import com.selab.backend.services.DeadlineService;
import com.selab.backend.services.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class DeadLineController {

    private final DeadlineService deadlineService;
    private final DeadLineMapper deadLineMapper;
    private final NotificationService notificationService;
    @PostMapping()
    public ResponseEntity<List<DeadLineDto>> createDeadLine(@RequestBody @Valid CreateDeadLineRequest request, @AuthenticationPrincipal User user){
          List<Event> deadLines=deadlineService.create(request,user);
          List<DeadLineDto> deadLineDtos=deadLines.stream().map(deadLineMapper::toDto).toList();
         return new ResponseEntity<>(deadLineDtos, HttpStatus.OK);
    }

    @GetMapping
    public ResponseEntity<List<DeadLineDto>> getAll(@AuthenticationPrincipal User user){
        List<Event> deadLines=deadlineService.getAll(user);
        List<DeadLineDto> deadLineDtos=deadLines.stream().map(deadLineMapper::toDto).toList();
        return new ResponseEntity<>(deadLineDtos, HttpStatus.OK);
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteDeadLine(@PathVariable Long id,@AuthenticationPrincipal User user){
         deadlineService.delete(id,user);
        return new ResponseEntity<>("deleted sucessfully !!", HttpStatus.OK);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<DeadLineDto> updateDeadLine(@PathVariable Long id,@AuthenticationPrincipal User user,@RequestBody DeadLineDto request){
        Event updatedDeadLine = deadlineService.update(id,user,request);
        return new ResponseEntity<>(deadLineMapper.toDto(updatedDeadLine),HttpStatus.OK);
    }

    @PostMapping("/{id}/reminder")
    public ResponseEntity<?> sendEventRemainder(@Valid @RequestBody RemainderEmail content, @AuthenticationPrincipal User user,@PathVariable Long id){
        System.out.println(content);
        notificationService.sendRemainder(content,user,id);
        return ResponseEntity.ok().body("Remainders sent successfully");
    }
}
