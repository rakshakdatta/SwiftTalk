package com.SwiftTalk.mapper;

import com.SwiftTalk.dto.UserResponse;
import com.SwiftTalk.entity.User;

public class UserMapper {

    public static UserResponse toUserResponse(User user) {
        if (user == null) return null;

        UserResponse dto = new UserResponse();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setBio(user.getBio());
        dto.setHasProfileImage(user.getProfileImage() != null && user.getProfileImage().length > 0);
        return dto;
    }

    // Optional: for future use if needed
    public static User fromUserResponse(UserResponse dto) {
        if (dto == null) return null;

        return User.builder()
            .id(dto.getId())
            .username(dto.getUsername())
            .email(dto.getEmail())
            .bio(dto.getBio())
            .build();
    }
}
