package com.SwiftTalk.dto;

import lombok.Data;

//OtpRequest.java
@Data
public class OtpRequest {
 private String method; // "email" or "phone"
 private String email;
 private String phone;
}
