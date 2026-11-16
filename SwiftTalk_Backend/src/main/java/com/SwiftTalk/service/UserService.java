package com.SwiftTalk.service;

import java.util.List;
import java.util.Optional;

import com.SwiftTalk.dto.UpdatePasswordRequest;
import com.SwiftTalk.dto.UserResponse;
import com.SwiftTalk.entity.User;

public interface UserService {

    User findById(Long id);

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByPhoneNumber(String phone);

    List<UserResponse> getAllUsers(); // for UI listing/chat

    // --- New methods for profile management ---

    void updateUsername(Long userId, String newUsername);

    void updateBio(Long userId, String bio);

    void updatePassword(Long userId, UpdatePasswordRequest request);

    void setProfileImage(Long userId, byte[] imageBytes);

    void removeProfileImage(Long userId);

    byte[] getProfileImage(Long userId);
}
