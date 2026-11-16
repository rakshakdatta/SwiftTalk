package com.SwiftTalk.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.SwiftTalk.entity.ChatRoom;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    boolean existsByName(String name);
}
