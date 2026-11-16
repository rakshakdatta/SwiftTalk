package com.SwiftTalk.service;

import java.util.List;

import com.SwiftTalk.dto.ChatMessageDTO;
import com.SwiftTalk.dto.MessageResponse;

public interface ChatService {

    MessageResponse sendMessage(ChatMessageDTO messageDTO);
    List<MessageResponse> getMessagesBetweenUsers(Long userId1, Long userId2);

    List<MessageResponse> getMessagesInRoom(Long chatRoomId);

    void clearChatHistory(Long userId, Long partnerId);
}
