package com.SwiftTalk.security;

import java.security.Principal;
import java.util.Collections;
import java.util.Map;

import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

import com.SwiftTalk.entity.User;
import com.SwiftTalk.repository.UserRepository;

import jakarta.servlet.http.HttpServletRequest;

public class WebSocketAuthHandshakeHandler extends DefaultHandshakeHandler {

    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;

    public WebSocketAuthHandshakeHandler(JwtTokenProvider tokenProvider, UserRepository userRepository) {
        this.tokenProvider = tokenProvider;
        this.userRepository = userRepository;
    }

    @Override
    protected Principal determineUser(@NonNull ServerHttpRequest request,
                                      @NonNull WebSocketHandler wsHandler,
                                      @NonNull Map<String, Object> attributes) {

        if (request instanceof ServletServerHttpRequest servletRequest) {
            HttpServletRequest httpRequest = servletRequest.getServletRequest();
            String token = httpRequest.getParameter("token");

            if (token != null && tokenProvider.validateToken(token)) {
                Long userId = tokenProvider.getUserIdFromToken(token);
                User user = userRepository.findById(userId).orElse(null);

                if (user != null) {
                    String username = user.getUsername(); // ✅ match this to your convertAndSendToUser call

                    System.out.println("✅ WebSocket handshake principal resolved as: " + username);

                    return new UsernamePasswordAuthenticationToken(username, null, Collections.emptyList());
                }
            }
        }

        System.out.println("❌ WebSocket handshake failed: invalid or missing token");
        return null;
    }
}
