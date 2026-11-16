package com.SwiftTalk.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "call_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CallLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "caller_id", nullable = false)
    private User caller;

    @ManyToOne
    @JoinColumn(name = "receiver_id", nullable = false)
    private User receiver;

    @Column(nullable = false)
    private boolean isVideoCall;

    private int durationInSeconds;

    @Enumerated(EnumType.STRING)
    private CallStatus status;

    private LocalDateTime timestamp;

    public enum CallStatus {
        STARTED,
        MISSED,
        ENDED,
        DECLINED
    }
}
