package com.SwiftTalk.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

import com.SwiftTalk.security.SignalingHandler;

@Configuration
@EnableWebSocket
public class SignalingWebSocketConfig implements WebSocketConfigurer {

    private final SignalingHandler signalingHandler;

    public SignalingWebSocketConfig(SignalingHandler signalingHandler) {
        this.signalingHandler = signalingHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(signalingHandler, "/signaling")
        .setAllowedOrigins("http://localhost:3002");
    }
}
