package com.selab.backend.interceptor;

import com.selab.backend.exceptions.FileValidationException;
import com.selab.backend.exceptions.TeamInvalidException;
import com.selab.backend.exceptions.UserNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class AppExceptionHandler {
    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<String> handleUserNotFoundException(UserNotFoundException e) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleMethodArgumentNotValidException(MethodArgumentNotValidException ex){
        Map<String ,String> errors= new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> errors.put(error.getField(),error.getDefaultMessage()));

        return ResponseEntity.badRequest().body(errors);
    }

    @ExceptionHandler(FileValidationException.class)
    public ResponseEntity<?> handleFileValidationException(FileValidationException ex){
        return ResponseEntity.badRequest().body(ex.getMessage());
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> handleRuntimeException(RuntimeException ex){
        return ResponseEntity.internalServerError().body(ex.getMessage());
    }

    @ExceptionHandler(TeamInvalidException.class)
    public ResponseEntity<?> handleTeamInvalidException(TeamInvalidException ex){
        return ResponseEntity.badRequest().body(ex.getMessage());
    }
}
