package com.SwiftTalk.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class MessageResponse {
    private Long id;
    private String content;
    private Long senderId;
    private Long receiverId;
    private Long chatRoomId;
    private boolean isRead;
    private LocalDateTime timestamp;
}
