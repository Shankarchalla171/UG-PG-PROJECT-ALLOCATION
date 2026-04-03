package com.selab.backend.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name="collaborations")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Collaboration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Professor sender;

    @ManyToOne
    private Professor receiver;

    @ManyToOne
    private Project project;

    @Enumerated(EnumType.STRING)
    private CollaborationStatus status;
}
