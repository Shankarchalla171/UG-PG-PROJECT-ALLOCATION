package com.selab.backend.repositories;

import com.selab.backend.models.DeptCoordinator;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DeptCoordinatorRepository extends JpaRepository<DeptCoordinator, Long> {
    Optional<DeptCoordinator> findByDeptName(String deptName);
}
