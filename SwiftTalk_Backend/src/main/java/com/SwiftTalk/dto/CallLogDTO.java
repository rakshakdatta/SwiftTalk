package com.SwiftTalk.dto;

import java.time.LocalDateTime;

import com.SwiftTalk.entity.CallLog.CallStatus;

import lombok.Data;

@Data
public class CallLogDTO {
    private Long callerId;
    private Long receiverId;
    private boolean isVideoCall;
    private int durationInSeconds;
    private CallStatus status;
    private LocalDateTime timestamp;
}
