package com.selab.backend.models;

import jakarta.persistence.*;
import lombok.*;

@Entity(name="collaborations")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Collaboration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    private Professor sender;

    @OneToOne
    private Professor receiver;

    @OneToOne
    private Project project;

    @Enumerated(EnumType.STRING)
    private CollaborationStatus status;
}
