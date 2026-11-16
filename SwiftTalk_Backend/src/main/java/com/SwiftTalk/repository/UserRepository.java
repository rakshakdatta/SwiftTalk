package com.SwiftTalk.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.SwiftTalk.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByPhoneNumber(String phoneNumber);
    Optional<User> findByPhoneNumber(String phoneNumber);

}
