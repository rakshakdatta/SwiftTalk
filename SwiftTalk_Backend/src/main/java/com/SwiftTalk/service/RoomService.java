package com.SwiftTalk.service;

import java.util.List;

import com.SwiftTalk.dto.RoomCreateRequest;
import com.SwiftTalk.entity.ChatRoom;

public interface RoomService {

    ChatRoom createRoom(RoomCreateRequest request);

    List<ChatRoom> getAllRooms();

    ChatRoom findById(Long roomId);
}
