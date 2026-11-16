package com.SwiftTalk.service.serviceIMPL;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.SwiftTalk.dto.UpdatePasswordRequest;
import com.SwiftTalk.dto.UserResponse;
import com.SwiftTalk.entity.User;
import com.SwiftTalk.mapper.UserMapper;
import com.SwiftTalk.repository.UserRepository;
import com.SwiftTalk.service.UserService;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public User findById(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    @Override
    public boolean existsByPhoneNumber(String phone) {
        return userRepository.existsByPhoneNumber(phone);
    }

    @Override
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserMapper::toUserResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void updateUsername(Long userId, String newUsername) {
        User user = findById(userId);

        // Only check for uniqueness if the username is actually changing
        if (!user.getUsername().equalsIgnoreCase(newUsername)
                && userRepository.existsByUsername(newUsername)) {
            throw new RuntimeException("Username already taken");
        }

        user.setUsername(newUsername);
        userRepository.save(user);
    }

    @Override
    public void updateBio(Long userId, String bio) {
        User user = findById(userId);
        user.setBio(bio);
        userRepository.save(user);
    }

    @Override
    public void updatePassword(Long userId, UpdatePasswordRequest request) {
        User user = findById(userId);

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        String encoded = passwordEncoder.encode(request.getNewPassword());
        user.setPassword(encoded);
        userRepository.save(user);
    }

    @Override
    public void setProfileImage(Long userId, byte[] imageBytes) {
    	System.out.println("📦 Image byte size: " + imageBytes.length + " bytes");
        User user = findById(userId);
        user.setProfileImage(imageBytes);
        userRepository.save(user);
    }

    @Override
    public void removeProfileImage(Long userId) {
        User user = findById(userId);
        user.setProfileImage(null);
        userRepository.save(user);
    }

    @Override
    public byte[] getProfileImage(Long userId) {
        User user = findById(userId);
        return user.getProfileImage();
    }
}
