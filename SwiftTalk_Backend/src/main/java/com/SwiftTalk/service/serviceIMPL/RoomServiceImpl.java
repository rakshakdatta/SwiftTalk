package com.SwiftTalk.service.serviceIMPL;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.SwiftTalk.dto.RoomCreateRequest;
import com.SwiftTalk.entity.ChatRoom;
import com.SwiftTalk.entity.User;
import com.SwiftTalk.repository.ChatRoomRepository;
import com.SwiftTalk.repository.UserRepository;
import com.SwiftTalk.service.RoomService;

@Service
public class RoomServiceImpl implements RoomService {

    @Autowired
    private ChatRoomRepository chatRoomRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public ChatRoom createRoom(RoomCreateRequest request) {
        Set<User> participants = new HashSet<>();
        for (Long userId : request.getParticipantIds()) {
            userRepository.findById(userId).ifPresent(participants::add);
        }

        ChatRoom room = ChatRoom.builder()
                .name(request.getName())
                .isGroup(request.isGroup())
                .participants(participants)
                .build();

        return chatRoomRepository.save(room);
    }

    @Override
    public List<ChatRoom> getAllRooms() {
        return chatRoomRepository.findAll();
    }

    @Override
    public ChatRoom findById(Long roomId) {
        return chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));
    }
}
