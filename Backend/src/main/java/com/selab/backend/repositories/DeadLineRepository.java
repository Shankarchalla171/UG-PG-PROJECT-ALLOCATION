package com.selab.backend.repositories;

import com.selab.backend.models.Event;
import com.selab.backend.models.DeptCoordinator;
import com.selab.backend.models.Phase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DeadLineRepository extends JpaRepository<Event,Long> {
    List<Event> findAllByDeptCoordinator(DeptCoordinator deptCoordinator);

    @Query("select max(d.endDate) from Event d where d.deptCoordinator = :coordinator and d.phase= :phaseType")
    LocalDate findDeadLineEndDate(@Param("coordinator") DeptCoordinator coordinator, @Param("phaseType") Phase phaseType);


    @Query("select min(d.startDate) from Event d where d.deptCoordinator = :coordinator and d.phase= :phaseType")
    LocalDate findDeadLineStartDate(@Param("coordinator") DeptCoordinator coordinator, @Param("phaseType") Phase phaseType);

    Optional<Event> findById(Long id);
}
