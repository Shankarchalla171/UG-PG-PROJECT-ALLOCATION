package com.selab.backend.repositories;

import com.selab.backend.models.Collaboration;
import com.selab.backend.models.Professor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CollaborationRepository extends JpaRepository< Collaboration,Long> {
    List<Collaboration> findAllBySender(Professor sender);
    List<Collaboration> findAllByReceiver(Professor receiver);
}
