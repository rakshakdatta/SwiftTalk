package com.SwiftTalk.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.SwiftTalk.entity.ClearedChat;

public interface ClearedChatRepository extends JpaRepository<ClearedChat, Long> {

    Optional<ClearedChat> findByUserIdAndPartnerId(Long userId, Long partnerId);

    void deleteByUserIdAndPartnerId(Long userId, Long partnerId);
}
