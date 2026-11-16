package com.SwiftTalk.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.SwiftTalk.dto.LoginRequest;
import com.SwiftTalk.dto.LoginResponse;
import com.SwiftTalk.dto.OtpDelivery;
import com.SwiftTalk.dto.OtpRequest;
import com.SwiftTalk.dto.OtpVerificationRequest;
import com.SwiftTalk.dto.SignupRequest;
import com.SwiftTalk.service.AuthService;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest request) {
        var account = authService.signup(request);
        if (account.isPresent()) {
            return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(account.get());
        }
        return ResponseEntity.ok("Signup data saved temporarily. Proceed to OTP verification.");
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/send-otp")
    public ResponseEntity<OtpDelivery> sendOtp(@RequestBody OtpRequest request) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(authService.sendOtp(request));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<LoginResponse> verifyOtp(@RequestBody OtpVerificationRequest request) {
        LoginResponse response = authService.verifyOtp(request);
        return ResponseEntity.ok(response);
    }
}
