package com.selab.backend.services;

import com.selab.backend.Dto.StudentDto;
import com.selab.backend.Dto.TeamDto;
import com.selab.backend.exceptions.ResourceNotFoundException;
import com.selab.backend.exceptions.TeamInvalidException;
import com.selab.backend.exceptions.UserNotFoundException;
import com.selab.backend.mappers.StudentMapper;
import com.selab.backend.models.*;
import com.selab.backend.repositories.DeptCoordinatorRepository;
import com.selab.backend.repositories.StudentRepository;
import com.selab.backend.repositories.TeamRepository;
import com.selab.backend.repositories.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class TeamService {
    private final TeamRepository teamRepository;
    private final StudentRepository studentRepository;
    private final StudentMapper studentMapper;
    private final UserRepository userRepository;
    private final DeptCoordinatorRepository deptCoordinatorRepository;


    @Transactional
    public TeamDto create(User user) {
        Student teamLead=studentRepository.findByUser(user).orElseThrow(()-> new UserNotFoundException("user with email"+user.getEmail()+" not Found"));

        if(teamRepository.existsByTeamLead(teamLead)){
            throw   new RuntimeException("Team already leads a team");
        }

        Team team= new Team();
        team.setTeamLead(teamLead);
        team.setIsFinalized(false);

        String fullName = teamLead.getName();
        String teamName = fullName + "_and_team";

        team.setTeamName(teamName);

        teamLead.setTeam(team);
        teamLead.setTeamRole(TeamRole.TEAMlEAD);

        team.setTeamMembers(List.of(teamLead));

        Team savedTeam= teamRepository.save(team);
        StudentDto memberDto=studentMapper.toDto(teamLead);

        return TeamDto.builder()
                .teamId(savedTeam.getTeamId())
                .members(List.of(memberDto))
                .isFinalized(savedTeam.getIsFinalized())
                .build();
    }

    public TeamDto getTeam(User user) {
        Student student=studentRepository.findByUser(user).orElseThrow(()-> new UserNotFoundException("user with email"+user.getEmail()+" not Found"));

        Team team= student.getTeam();

        List<StudentDto> memberDtos= team.getTeamMembers().stream()
                .sorted((a, b) -> {
                    if (a.getTeamRole() == TeamRole.TEAMlEAD) return -1;
                    if (b.getTeamRole() == TeamRole.TEAMlEAD) return 1;
                    return 0;
                })
                .map(studentMapper::toDto).toList();

        return TeamDto.builder()
                .teamId(team.getTeamId())
                .members(memberDtos)
                .isFinalized(team.getIsFinalized())
                .build();
    }

    @Transactional
    public TeamDto join(User user, UUID teamId) {
        System.out.println("teamId is  : "+teamId);

        Student student =studentRepository.findByUser(user).orElseThrow(()-> new UserNotFoundException("user with email"+user.getEmail()+" not Found"));
        Team currentTeam = teamRepository.findTeamWithMembers(teamId).orElseThrow(()-> new RuntimeException("team not found"));
        Student teamLead= studentRepository.findByTeamAndTeamRole(currentTeam, TeamRole.TEAMlEAD).orElseThrow(()-> new TeamInvalidException("cant find lead of this team"));
        DeptCoordinator coordinator= deptCoordinatorRepository.findByDeptNameAndIsActive(student.getDepartmentName(), true).orElseThrow(()-> new ResourceNotFoundException(" please wait until the coordinator sets the team size limit"));
        if(currentTeam.getTeamMembers().size()==coordinator.getMaxTeamSize() ){
            throw new TeamInvalidException("This team is full! Maximum "+coordinator.getMaxTeamSize()+" members allowed.");
        }
        if(student.getDepartmentName().equals(teamLead.getDepartmentName()))
             throw new TeamInvalidException("you cant join teams of  other departments ");
        if(currentTeam.getIsFinalized())
             throw new TeamInvalidException("The team is already finalized , you cant join them");
        student.setTeam(currentTeam);
        student.setTeamRole(TeamRole.TEAM_MEMBER);
        currentTeam.getTeamMembers().add(student);
        teamRepository.save(currentTeam);
        return getTeam(user);
    }

    @Transactional
    public void leaveTeam(User user) {
        Student teamMember=studentRepository.findByUser(user).orElseThrow(()-> new UserNotFoundException("user with email"+user.getEmail()+" not Found"));
        Team currentTeam=teamMember.getTeam();

        if(teamMember.getTeamRole() == null ){
            throw new TeamInvalidException("the user not part of anyTeam");
        }else if( currentTeam.getIsFinalized()){
            throw new TeamInvalidException("Team once finalized cant be changed");
        }else if(teamMember.getTeamRole() == TeamRole.TEAM_MEMBER){
            currentTeam.getTeamMembers().remove(teamMember);
        }else{
            //transfer the ownership , then remove the leave the team
            if(currentTeam.getTeamMembers().size() <=1){
                teamRepository.delete(currentTeam);

            }else{
                Student newLeader = currentTeam.getTeamMembers().stream()
                        .filter(mem -> mem != teamMember)
                        .findFirst()
                        .orElse(null);

                newLeader.setTeamRole(TeamRole.TEAMlEAD);
                currentTeam.setTeamLead(newLeader);
            }
        }
        teamMember.setTeamRole(null);
        teamMember.setTeam(null);
    }

    @Transactional
    public TeamDto transferLead(User user, Long newLeadId) {
        Student oldLead = studentRepository.findByUser(user).orElseThrow(()-> new UserNotFoundException("user with email"+user.getEmail()+" not Found"));
        Student newLead = studentRepository.findByStudentId(newLeadId).orElseThrow(()-> new UserNotFoundException("user with email"+user.getEmail()+" not Found"));

        Team team = teamRepository.findByTeamLead(oldLead).orElseThrow(()-> new TeamInvalidException("Team with teamLead : "+oldLead.getName()+" not found"));

        oldLead.setTeamRole(TeamRole.TEAM_MEMBER);
        newLead.setTeamRole(TeamRole.TEAMlEAD);

        team.setTeamLead(newLead);

        String fullName = newLead.getName();
        String teamName = fullName + "_and_team";

        team.setTeamName(teamName);

        List<StudentDto> membersDto= team.getTeamMembers().stream()
                .map(studentMapper::toDto).toList();
        return TeamDto.builder()
                .teamId(team.getTeamId())
                .members(membersDto)
                .isFinalized(team.getIsFinalized())
                .build();
    }

    @Transactional
    public void finalise(User user,UUID teamId) {

        Student member=studentRepository.findByUser(user).orElseThrow(()-> new UserNotFoundException("user with email"+user.getEmail()+" not Found"));
        Team team= teamRepository.findTeamByTeamId(teamId).orElseThrow(()-> new TeamInvalidException("Team not found.."));

        if(member.getTeamRole() != TeamRole.TEAMlEAD){
            throw new TeamInvalidException("only Team Leader can finalise the team");
        }
        System.out.println(member.getTeam().getTeamId());
        if(!member.getTeam().getTeamId().equals(teamId)){
            throw new TeamInvalidException("student does not belong to the Team With id :"+ teamId);
        }

        System.out.println("reached update statement");
        team.setIsFinalized(true);
        System.out.println("update done");
    }

    public TeamDto getTeamFromId(UUID teamId) {
        Team team = teamRepository.findTeamByTeamId(teamId).orElseThrow(()-> new ResourceNotFoundException("Team not found.."));
        List<StudentDto> memberDtos= team.getTeamMembers().stream()
                .sorted((a, b) -> {
                    if (a.getTeamRole() == TeamRole.TEAMlEAD) return -1;
                    if (b.getTeamRole() == TeamRole.TEAMlEAD) return 1;
                    return 0;
                })
                .map(studentMapper::toDto).toList();

        return TeamDto.builder()
                .teamId(team.getTeamId())
                .members(memberDtos)
                .isFinalized(team.getIsFinalized())
                .build();
    }
}