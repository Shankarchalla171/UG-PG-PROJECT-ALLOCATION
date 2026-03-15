package com.selab.backend.repositories;

import com.selab.backend.models.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByTitleContainingIgnoreCase(String keyword);
    Optional<Project> findByTitleIgnoreCase(String title);
    List<Project> findByProfessorProfessorId(Long professorId);
    List<Project> findBySlots(int slots);
    List<Project> findBySlotsGreaterThanEqual(int minSlots);
}