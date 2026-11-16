package com.SwiftTalk.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.SwiftTalk.entity.ChatRoom;
import com.SwiftTalk.entity.Message;
import com.SwiftTalk.entity.User;

public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findByReceiver(User receiver);

    List<Message> findByChatRoom(ChatRoom chatRoom);

    /**
     * ✅ NEW: Fetch full conversation between two users (bidirectional)
     * Ordered chronologically by timestamp.
     */
    @Query("SELECT m FROM Message m WHERE " +
           "(m.sender = :user1 AND m.receiver = :user2) OR " +
           "(m.sender = :user2 AND m.receiver = :user1) " +
           "ORDER BY m.timestamp ASC")
    List<Message> findConversationBetweenUsers(
        @Param("user1") User user1,
        @Param("user2") User user2
    );
}
