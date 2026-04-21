package com.selab.backend.models;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

@Entity
@Table(name = "professor_batch_quota")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProfessorBatchQuota {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Many quota rows can belong to one professor
     * Example:
     * Professor A -> B23
     * Professor A -> B22
     * Professor A -> P25
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "professor_id", nullable = false)
    private Professor professor;

    /**
     * Batch code like:
     * B23, B22, P25, M24
     */
    @Column(nullable = false, length = 10)
    private String batch;

    /**
     * Maximum number of students allowed
     * for this professor in this batch
     */
    @Column(name = "max_students", nullable = false)
    private Long maxStudents;

    /**
     * Number of students already allocated
     * through confirmed project handshakes
     */
    @Column(name = "allocated_students", nullable = false)
    @Builder.Default
    private Double allocatedStudents = 0.0;

}
