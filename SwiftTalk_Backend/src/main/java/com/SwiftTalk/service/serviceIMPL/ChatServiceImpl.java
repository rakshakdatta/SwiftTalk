package com.SwiftTalk.service.serviceIMPL;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.SwiftTalk.dto.ChatMessageDTO;
import com.SwiftTalk.dto.MessageResponse;
import com.SwiftTalk.entity.ChatRoom;
import com.SwiftTalk.entity.ClearedChat;
import com.SwiftTalk.entity.Message;
import com.SwiftTalk.entity.User;
import com.SwiftTalk.mapper.MessageMapper;
import com.SwiftTalk.repository.ChatRoomRepository;
import com.SwiftTalk.repository.ClearedChatRepository;
import com.SwiftTalk.repository.MessageRepository;
import com.SwiftTalk.repository.UserRepository;
import com.SwiftTalk.service.ChatService;

@Service
public class ChatServiceImpl implements ChatService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ChatRoomRepository chatRoomRepository;

    @Autowired
    private ClearedChatRepository clearedChatRepository;

    @Override
    public MessageResponse sendMessage(ChatMessageDTO dto) {
        User sender = userRepository.findById(dto.getSenderId())
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        User receiver = dto.getReceiverId() != null
                ? userRepository.findById(dto.getReceiverId()).orElse(null)
                : null;
        ChatRoom room = dto.getChatRoomId() != null
                ? chatRoomRepository.findById(dto.getChatRoomId()).orElse(null)
                : null;

        Message message = MessageMapper.fromChatMessageDTO(dto, sender, receiver, room);
        return MessageMapper.toMessageResponse(messageRepository.save(message));
    }

    @Override
    public List<MessageResponse> getMessagesBetweenUsers(Long viewerId, Long partnerId) {
        User viewer = userRepository.findById(viewerId).orElseThrow();
        User partner = userRepository.findById(partnerId).orElseThrow();

        List<Message> all = messageRepository.findConversationBetweenUsers(viewer, partner);

        Optional<ClearedChat> viewerClear = clearedChatRepository.findByUserIdAndPartnerId(viewerId, partnerId);
        LocalDateTime viewerClearedAt = viewerClear.map(ClearedChat::getClearedAt).orElse(null);

        List<Message> filtered = all;

        if (viewerClearedAt != null) {
            filtered = all.stream()
                    .filter(m -> m.getTimestamp().isAfter(viewerClearedAt))
                    .collect(Collectors.toList());
        }

        return filtered.stream().map(MessageMapper::toMessageResponse).collect(Collectors.toList());
    }

    @Override
    public List<MessageResponse> getMessagesInRoom(Long chatRoomId) {
        ChatRoom room = chatRoomRepository.findById(chatRoomId).orElseThrow();
        return messageRepository.findByChatRoom(room).stream()
                .map(MessageMapper::toMessageResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void clearChatHistory(Long userId, Long partnerId) {
        clearedChatRepository.deleteByUserIdAndPartnerId(userId, partnerId);

        LocalDateTime now = LocalDateTime.now();

        ClearedChat cleared = ClearedChat.builder()
                .userId(userId)
                .partnerId(partnerId)
                .clearedAt(now)
                .build();
        clearedChatRepository.save(cleared);

        Optional<ClearedChat> partnerClearOpt = clearedChatRepository.findByUserIdAndPartnerId(partnerId, userId);

        if (partnerClearOpt.isPresent()) {
            LocalDateTime partnerClearedAt = partnerClearOpt.get().getClearedAt();
            LocalDateTime deletionCutoff = now.isBefore(partnerClearedAt) ? now : partnerClearedAt;

            User user1 = userRepository.findById(userId).orElseThrow();
            User user2 = userRepository.findById(partnerId).orElseThrow();

            List<Message> messagesToDelete = messageRepository.findConversationBetweenUsers(user1, user2).stream()
                    .filter(m -> m.getTimestamp().isBefore(deletionCutoff))
                    .collect(Collectors.toList());

            if (!messagesToDelete.isEmpty()) {
                messageRepository.deleteAll(messagesToDelete);
            }
        }
    }
}
