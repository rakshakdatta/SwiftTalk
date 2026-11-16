package com.SwiftTalk.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.SwiftTalk.dto.ChatMessageDTO;
import com.SwiftTalk.dto.MessageResponse;
import com.SwiftTalk.entity.User;
import com.SwiftTalk.service.ChatService;
import com.SwiftTalk.service.UserService;

@RestController
@RequestMapping
public class ChatController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private UserService userService;

    @Autowired
    private ChatService chatService;

    /**
     * For public broadcast chat (if applicable)
     */
    @MessageMapping("/chat.send")
    @SendTo("/topic/public")
    public MessageResponse sendPublicMessage(@Payload ChatMessageDTO dto) {
        return chatService.sendMessage(dto);
    }

    /**
     * Private messaging endpoint over STOMP
     */
    @MessageMapping("/chat.private")
    public void sendPrivateMessage(@Payload ChatMessageDTO dto) {
        // Save message
        MessageResponse saved = chatService.sendMessage(dto);

        // Find recipient's username
        String receiverUsername = userService
            .findById(dto.getReceiverId())
            .getUsername();

        // Send to receiver's STOMP queue
        messagingTemplate.convertAndSendToUser(
            receiverUsername,
            "/queue/private",
            saved
        );

        // Optional log for debug
        System.out.println("📤 Sent to user [" + receiverUsername + "]: " + saved.getContent());
    }

    /**
     * REST: Fetch messages between two users (with auth filtering)
     */
    @GetMapping("/messages/{senderId}/{receiverId}")
    public ResponseEntity<List<MessageResponse>> getMessages(
            @PathVariable Long senderId,
            @PathVariable Long receiverId,
            Authentication authentication
    ) {
        User currentUser = (User) authentication.getPrincipal();
        Long currentUserId = currentUser.getId();

        if (!currentUserId.equals(senderId) && !currentUserId.equals(receiverId)) {
            return ResponseEntity.status(403).build();
        }

        Long partnerId = currentUserId.equals(senderId) ? receiverId : senderId;
        List<MessageResponse> messages = chatService.getMessagesBetweenUsers(currentUserId, partnerId);
        return ResponseEntity.ok(messages);
    }

    /**
     * REST: Clear chat (partial view or full deletion if both cleared)
     */
    @DeleteMapping("/messages/clear")
    @Transactional
    public ResponseEntity<String> clearChat(
            @RequestParam Long userId,
            @RequestParam Long partnerId
    ) {
        chatService.clearChatHistory(userId, partnerId);
        return ResponseEntity.ok("Chat cleared for user " + userId);
    }
}
