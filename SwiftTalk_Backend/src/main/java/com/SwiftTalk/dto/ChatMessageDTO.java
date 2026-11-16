package com.SwiftTalk.dto;

import lombok.Data;

@Data
public class ChatMessageDTO {
    private Long id;
    private Long senderId;
    private Long receiverId;
    private String content;
    private Long chatRoomId;
    private String timestamp;
}
