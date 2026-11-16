package com.SwiftTalk.controller;

import com.SwiftTalk.dto.RoomCreateRequest;
import com.SwiftTalk.entity.ChatRoom;
import com.SwiftTalk.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/rooms")
public class RoomController {

    @Autowired
    private RoomService roomService;

    @PostMapping
    public ChatRoom createRoom(@RequestBody RoomCreateRequest request) {
        return roomService.createRoom(request);
    }

    @GetMapping
    public List<ChatRoom> getAllRooms() {
        return roomService.getAllRooms();
    }

    @GetMapping("/{id}")
    public ChatRoom getRoomById(@PathVariable Long id) {
        return roomService.findById(id);
    }
}
