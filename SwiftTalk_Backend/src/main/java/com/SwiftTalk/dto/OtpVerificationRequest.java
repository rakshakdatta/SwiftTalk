package com.SwiftTalk.dto;

import lombok.Data;

//OtpVerificationRequest.java
@Data
public class OtpVerificationRequest {
 private String method;
 private String email;
 private String phone;
 private String otp;
}
