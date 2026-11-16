package com.SwiftTalk.mapper;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;

import com.SwiftTalk.dto.ChatMessageDTO;
import com.SwiftTalk.dto.MessageResponse;
import com.SwiftTalk.entity.ChatRoom;
import com.SwiftTalk.entity.Message;
import com.SwiftTalk.entity.User;

public class MessageMapper {

    public static MessageResponse toMessageResponse(Message message) {
        if (message == null) return null;

        MessageResponse dto = new MessageResponse();
        dto.setId(message.getId());
        dto.setContent(message.getContent());
        dto.setSenderId(message.getSender().getId());

        if (message.getReceiver() != null) {
            dto.setReceiverId(message.getReceiver().getId());
        }

        if (message.getChatRoom() != null) {
            dto.setChatRoomId(message.getChatRoom().getId());
        }

        dto.setTimestamp(message.getTimestamp());
        dto.setRead(message.isRead());

        return dto;
    }

    public static Message fromChatMessageDTO(ChatMessageDTO dto, User sender, User receiver, ChatRoom room) {
        // Safely parse ISO-8601 UTC timestamp from frontend (with 'Z')
        LocalDateTime resolvedTimestamp = dto.getTimestamp() != null
            ? Instant.parse(dto.getTimestamp()).atZone(ZoneId.systemDefault()).toLocalDateTime()
            : LocalDateTime.now();

        return Message.builder()
                // Do NOT set .id(...) to avoid detached object merge errors
                .content(dto.getContent())
                .sender(sender)
                .receiver(receiver) // can be null for group messages
                .chatRoom(room)     // can be null for 1-to-1 messages
                .timestamp(resolvedTimestamp)
                .isRead(false)
                .build();
    }
}
