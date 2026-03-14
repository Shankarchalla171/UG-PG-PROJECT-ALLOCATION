package com.selab.backend.repositories;

import com.selab.backend.models.DeptCoordinator;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DeptCoordinatorRepo extends JpaRepository<DeptCoordinator, Long> {

    DeptCoordinator findByEmail(String email);
}
