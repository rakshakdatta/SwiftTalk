package com.SwiftTalk.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.SwiftTalk.entity.CallLog;
import com.SwiftTalk.entity.User;

public interface CallLogRepository extends JpaRepository<CallLog, Long> {

    List<CallLog> findByCaller(User caller);
    List<CallLog> findByReceiver(User receiver);
}
