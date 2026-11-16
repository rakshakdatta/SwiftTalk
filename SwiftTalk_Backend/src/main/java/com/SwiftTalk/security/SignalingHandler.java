package com.SwiftTalk.security;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.WebSocketMessage;
import org.springframework.web.socket.WebSocketSession;

import com.SwiftTalk.dto.CallLogDTO;
import com.SwiftTalk.entity.CallLog.CallStatus;
import com.SwiftTalk.service.CallLogService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Component
public class SignalingHandler implements WebSocketHandler {

    private final Map<String, WebSocketSession> userSessions = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final CallLogService callLogService;

    @Autowired
    public SignalingHandler(CallLogService callLogService) {
        this.callLogService = callLogService;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String userId = getUserId(session);
        if (userId != null && !userId.trim().isEmpty() && !userId.equals("null") && !userId.equals("undefined")) {
            WebSocketSession previous = userSessions.put(userId, session);
            if (previous != null && previous.isOpen()) {
                previous.close(CloseStatus.NORMAL);
            }
            System.out.println("✅ Connected: " + userId);
        } else {
            System.out.println("❌ Invalid or missing userId. Closing connection.");
            session.close(CloseStatus.BAD_DATA);
        }
    }

    @Override
    public void handleMessage(WebSocketSession session, WebSocketMessage<?> message) throws Exception {
        String payload = message.getPayload().toString();
        System.out.println("📡 Signal received: " + payload);

        try {
            JsonNode msg = objectMapper.readTree(payload);
            String type = msg.has("type") ? msg.get("type").asText() : null;
            String fromUser = msg.has("from") ? msg.get("from").asText() : null;
            String toUser = msg.has("to") ? msg.get("to").asText() : null;

            if (type == null || fromUser == null || toUser == null) {
                System.out.println("❌ Invalid signaling message: missing fields.");
                return;
            }

            // Auto-log certain signaling types
            switch (type.toLowerCase()) {
                case "offer":
                    logCall(fromUser, toUser, CallStatus.STARTED);
                    break;
                case "end":
                    logCall(fromUser, toUser, CallStatus.ENDED);
                    break;
                case "missed":
                    logCall(fromUser, toUser, CallStatus.MISSED);
                    break;
                case "rejected":
                case "declined":
                    logCall(fromUser, toUser, CallStatus.DECLINED);
                    break;
                default:
                    // no logging
            }

            // Forward signaling message to recipient
            WebSocketSession targetSession = userSessions.get(toUser);
            if (targetSession != null && targetSession.isOpen()) {
                targetSession.sendMessage(new TextMessage(payload));
                System.out.println("➡️ Forwarded " + type + " from " + fromUser + " to " + toUser);
            } else {
                System.out.println("❌ Target not connected: " + toUser);
            }

        } catch (Exception e) {
            System.err.println("❌ Error processing signaling message: " + e.getMessage());
        }
    }

    private void logCall(String fromUser, String toUser, CallStatus status) {
        try {
            CallLogDTO log = new CallLogDTO();
            log.setCallerId(Long.parseLong(fromUser));
            log.setReceiverId(Long.parseLong(toUser));
            log.setStatus(status);
            log.setTimestamp(LocalDateTime.now());
            callLogService.saveCallLog(log);
            System.out.println("📝 CallLog saved: " + status + " from " + fromUser + " to " + toUser);
        } catch (Exception e) {
            System.err.println("❌ Failed to save CallLog: " + e.getMessage());
        }
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) {
        System.out.println("❌ Transport Error: " + exception.getMessage());
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String userId = getUserId(session);
        if (userId != null) {
            userSessions.remove(userId, session);
            System.out.println("👋 Disconnected: " + userId);
        }
    }

    @Override
    public boolean supportsPartialMessages() {
        return false;
    }

    private String getUserId(WebSocketSession session) {
        try {
            String query = session.getUri().getQuery();
            if (query != null) {
                for (String param : query.split("&")) {
                    String[] pair = param.split("=");
                    if (pair.length == 2 && pair[0].equals("userId")) {
                        return pair[1];
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("❌ Failed to extract userId: " + e.getMessage());
        }
        return null;
    }
}
