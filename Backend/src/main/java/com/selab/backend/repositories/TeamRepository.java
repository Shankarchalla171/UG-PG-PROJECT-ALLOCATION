package com.selab.backend.repositories;

import com.selab.backend.models.Student;
import com.selab.backend.models.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.UUID;

public interface TeamRepository extends JpaRepository<Team,UUID> {
    Boolean existsByTeamLead(Student teamLead);
    Optional<Team> findByTeamLead(Student teamLead);
    Boolean existsByTeamId(UUID teamId);

    @Query("SELECT t FROM Team t JOIN FETCH t.teamMembers WHERE t.teamId = :id")
    Optional<Team> findTeamWithMembers(UUID id);
    Optional<Team> findTeamByTeamId(UUID id);

//    @Query("""
//        SELECT t
//        FROM Team t
//        JOIN FETCH t.teamMembers tm
//        WHERE tm.member = :student
//        """)
//    Optional<Team> findTeamWithMembersByStudent(Student Student);
}
