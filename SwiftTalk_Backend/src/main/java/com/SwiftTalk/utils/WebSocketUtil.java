package com.SwiftTalk.utils;

import org.springframework.messaging.simp.stomp.StompHeaderAccessor;

public class WebSocketUtil {

    public static String getUsername(StompHeaderAccessor headerAccessor) {
        Object username = headerAccessor.getSessionAttributes().get("username");
        return username != null ? username.toString() : null;
    }
}
