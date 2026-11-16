package com.SwiftTalk.dto;

import lombok.Data;

@Data
public class SignupRequest {
    private String username;
    private String email;
    private String phoneNumber;
    private String password;
}
