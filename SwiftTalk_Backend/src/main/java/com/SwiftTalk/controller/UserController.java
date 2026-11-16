package com.SwiftTalk.controller;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.SwiftTalk.dto.UpdatePasswordRequest;
import com.SwiftTalk.dto.UserResponse;
import com.SwiftTalk.mapper.UserMapper;
import com.SwiftTalk.service.UserService;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    // 🔹 Get all users (public info)
    @GetMapping
    public List<UserResponse> getAllUsers() {
        return userService.getAllUsers();
    }

    // 🔹 Get single user by ID (public profile view)
    @GetMapping("/{id}")
    public UserResponse getUserById(@PathVariable Long id) {
        return UserMapper.toUserResponse(userService.findById(id));
    }

    // 🔹 Update username
    @PutMapping("/{id}/username")
    public ResponseEntity<String> updateUsername(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String username = body.get("username");
        if (username == null || username.isBlank()) {
            return ResponseEntity.badRequest().body("Username is required");
        }
        userService.updateUsername(id, username);
        return ResponseEntity.ok("Username updated successfully");
    }

    // 🔹 Update bio/status
    @PutMapping("/{id}/bio")
    public ResponseEntity<String> updateBio(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String bio = body.get("bio");
        userService.updateBio(id, bio);
        return ResponseEntity.ok("Bio updated successfully");
    }

    // 🔹 Change password
    @PutMapping("/{id}/password")
    public ResponseEntity<String> updatePassword(@PathVariable Long id, @RequestBody UpdatePasswordRequest request) {
        userService.updatePassword(id, request);
        return ResponseEntity.ok("Password updated successfully");
    }

    // 🔹 Upload or replace profile image
    @PostMapping("/{id}/profile-image")
    public ResponseEntity<String> uploadProfileImage(@PathVariable Long id, @RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty");
        }

        System.out.println("🖼 Uploading image:");
        System.out.println(" - Name: " + file.getOriginalFilename());
        System.out.println(" - Type: " + file.getContentType());
        System.out.println(" - Size: " + file.getSize() + " bytes");

        try {
            userService.setProfileImage(id, file.getBytes());
            return ResponseEntity.ok("Profile image uploaded successfully");
        } catch (Exception e) {
            System.err.println("❌ Failed to upload image: " + e.getMessage());
            return ResponseEntity.internalServerError().body("Failed to upload image");
        }
    }

    // 🔹 Delete profile image
    @DeleteMapping("/{id}/profile-image")
    public ResponseEntity<String> deleteProfileImage(@PathVariable Long id) {
        userService.removeProfileImage(id);
        return ResponseEntity.ok("Profile image deleted successfully");
    }

    // 🔹 Fetch profile image
    @GetMapping("/{id}/profile-image")
    public ResponseEntity<byte[]> getProfileImage(@PathVariable Long id) {
        byte[] image = userService.getProfileImage(id);
        if (image != null && image.length > 0) {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.IMAGE_JPEG);
            headers.setContentLength(image.length);
            return ResponseEntity.ok().headers(headers).body(image);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
