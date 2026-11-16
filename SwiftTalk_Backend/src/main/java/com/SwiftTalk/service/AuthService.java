package com.SwiftTalk.service;

import java.util.Optional;

import com.SwiftTalk.dto.LoginRequest;
import com.SwiftTalk.dto.LoginResponse;
import com.SwiftTalk.dto.OtpDelivery;
import com.SwiftTalk.dto.OtpRequest;
import com.SwiftTalk.dto.OtpVerificationRequest;
import com.SwiftTalk.dto.SignupRequest;

public interface AuthService {

    LoginResponse login(LoginRequest request);

    Optional<LoginResponse> signup(SignupRequest request);

    OtpDelivery sendOtp(OtpRequest request);

    LoginResponse verifyOtp(OtpVerificationRequest request);
}
