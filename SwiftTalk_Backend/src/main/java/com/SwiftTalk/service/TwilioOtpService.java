package com.SwiftTalk.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.twilio.Twilio;
import com.twilio.exception.ApiException;
import com.twilio.rest.verify.v2.service.Verification;
import com.twilio.rest.verify.v2.service.VerificationCheck;

import jakarta.annotation.PostConstruct;

@Service
public class TwilioOtpService {

    @Value("${twilio.account.sid}")
    private String accountSid;

    @Value("${twilio.auth.token}")
    private String authToken;

    @Value("${twilio.verify.sid}")
    private String verifyServiceSid;

    @PostConstruct
    public void init() {
        if (accountSid.isBlank() || authToken.isBlank() || verifyServiceSid.isBlank()) {
            return;
        }
        Twilio.init(accountSid, authToken);
        System.out.println("✅ Twilio initialized.");
    }

    private void requireConfiguration() {
        if (accountSid.isBlank() || authToken.isBlank() || verifyServiceSid.isBlank()) {
            throw new IllegalStateException("SMS verification is not configured");
        }
    }

    public void sendOtp(String phoneNumber) {
        requireConfiguration();
        try {
            Verification.creator(
                verifyServiceSid,
                phoneNumber,
                "sms" // channel: SMS only
            ).create();
            System.out.println("✅ OTP sent via Twilio to: " + phoneNumber);
        } catch (ApiException e) {
            throw new RuntimeException("Failed to send OTP: " + e.getMessage(), e);
        }
    }

    public boolean verifyOtp(String phoneNumber, String otp) {
        requireConfiguration();
        try {
            VerificationCheck verification = VerificationCheck.creator(verifyServiceSid)
                    .setTo(phoneNumber)
                    .setCode(otp)
                    .create();

            boolean approved = "approved".equalsIgnoreCase(verification.getStatus());
            System.out.println("✅ OTP verified: " + approved);
            return approved;
        } catch (ApiException e) {
            throw new RuntimeException("OTP verification failed: " + e.getMessage(), e);
        }
    }
}
