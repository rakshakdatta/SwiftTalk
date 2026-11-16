package com.SwiftTalk;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;

@SpringBootApplication
@EnableWebSocketMessageBroker  // Enables STOMP/WebSocket messaging
@EnableScheduling              // Optional: if you want to run scheduled tasks (can be removed if not used)
public class SwiftTalkApplication {

    public static void main(String[] args) {
        SpringApplication.run(SwiftTalkApplication.class, args);
        System.out.println("🚀 SwiftTalk backend started successfully!");
    }
}
