package com.SwiftTalk.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

@Configuration
public class RedisConfig {

    @Bean
    public LettuceConnectionFactory redisConnectionFactory() {
        return new LettuceConnectionFactory(); // localhost:6379 by default
    }

    // For storing file content (byte arrays) in Redis
    @Bean
    public RedisTemplate<String, byte[]> redisTemplate() {
        RedisTemplate<String, byte[]> template = new RedisTemplate<>();
        template.setConnectionFactory(redisConnectionFactory());
        return template;
    }

    // ObjectMapper for serializing/deserializing JSON (e.g., FileMetadata)
    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule()); // ✅ Java 8+ time support
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS); // ✅ ISO 8601 strings
        return mapper;
    }
}
