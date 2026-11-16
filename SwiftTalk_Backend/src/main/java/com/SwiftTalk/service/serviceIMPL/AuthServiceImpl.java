package com.SwiftTalk.service.serviceIMPL;

import java.time.Instant;
import java.time.Duration;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.SwiftTalk.dto.LoginRequest;
import com.SwiftTalk.dto.LoginResponse;
import com.SwiftTalk.dto.OtpDelivery;
import com.SwiftTalk.dto.OtpRequest;
import com.SwiftTalk.dto.OtpVerificationRequest;
import com.SwiftTalk.dto.SignupRequest;
import com.SwiftTalk.entity.User;
import com.SwiftTalk.repository.UserRepository;
import com.SwiftTalk.security.JwtTokenProvider;
import com.SwiftTalk.service.AuthService;
import com.SwiftTalk.service.EmailOtpService;
import com.SwiftTalk.service.TwilioOtpService;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private TwilioOtpService twilioOtpService;

    @Autowired
    private EmailOtpService emailOtpService;

    // Stores OTPs and signups temporarily
    private record EmailCode(String value, Instant expiresAt) {}

    @Autowired
    private Environment environment;

    @Value("${server.address:}")
    private String serverAddress;

    private final Map<String, EmailCode> otpStore = new ConcurrentHashMap<>();
    private final Map<String, SignupRequest> signupCache = new ConcurrentHashMap<>();

    @Override
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        return loginResponse(user);
    }

    @Override
    public Optional<LoginResponse> signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already taken");
        }
        if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new RuntimeException("Phone number already in use");
        }

        if (environment.acceptsProfiles(Profiles.of("local")) && "127.0.0.1".equals(serverAddress)) {
            return Optional.of(loginResponse(createUser(request)));
        }

        String normalizedEmail = request.getEmail().trim().toLowerCase(Locale.ROOT);
        String normalizedPhone = request.getPhoneNumber().trim();

        // 🔐 Store by both phone and email to support any method
        signupCache.put(normalizedPhone, request);
        signupCache.put(normalizedEmail, request);

        return Optional.empty();
    }

    @Override
    public OtpDelivery sendOtp(OtpRequest request) {
        String method = request.getMethod();

        if ("phone".equalsIgnoreCase(method)) {
            String phone = request.getPhone();
            if (phone == null || phone.isEmpty()) {
                throw new RuntimeException("Phone number is required");
            }
            twilioOtpService.sendOtp(phone.trim());
            return new OtpDelivery("phone");

        } else if ("email".equalsIgnoreCase(method)) {
            String email = request.getEmail();
            if (email == null || email.isEmpty()) {
                throw new RuntimeException("Email is required");
            }

            String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
            if (!signupCache.containsKey(normalizedEmail)) {
                throw new IllegalStateException("Start signup again to request a verification code.");
            }
            String otp = generateAlphaNumericOtp(5);
            emailOtpService.sendOtpToEmail(normalizedEmail, otp);
            otpStore.put(normalizedEmail, new EmailCode(otp, Instant.now().plus(Duration.ofMinutes(10))));
            return new OtpDelivery("email");
        }

        throw new RuntimeException("Invalid OTP method");
    }

    @Override
    public LoginResponse verifyOtp(OtpVerificationRequest request) {
        String method = request.getMethod();
        String key;

        if ("phone".equalsIgnoreCase(method)) {
            key = request.getPhone().trim();
            if (!twilioOtpService.verifyOtp(key, request.getOtp())) {
                throw new RuntimeException("Invalid or expired OTP");
            }

        } else if ("email".equalsIgnoreCase(method)) {
            key = request.getEmail().trim().toLowerCase(Locale.ROOT);
            EmailCode expected = otpStore.get(key);
            if (expected == null || !expected.expiresAt().isAfter(Instant.now())
                    || !expected.value().equalsIgnoreCase(request.getOtp())
                    || !otpStore.remove(key, expected)) {
                throw new IllegalArgumentException("Invalid or expired verification code.");
            }
        } else {
            throw new RuntimeException("Invalid verification method");
        }

        // ✅ Pull signup from cache regardless of method used
        SignupRequest cached = signupCache.remove(key);
        if (cached == null) {
            throw new RuntimeException("Signup data not found");
        }

        // Clean the alternate key too (prevent duplicates)
        String altKey = "phone".equals(method)
                ? cached.getEmail().trim().toLowerCase(Locale.ROOT)
                : cached.getPhoneNumber().trim();
        signupCache.remove(altKey);

        return loginResponse(createUser(cached));
    }

    private LoginResponse loginResponse(User user) {
        String token = jwtTokenProvider.generateToken(user.getId());

        return new LoginResponse(token, user.getUsername(), user.getId());
    }

    private User createUser(SignupRequest request) {
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .password(passwordEncoder.encode(request.getPassword()))
                .isOnline(false)
                .build();
        return userRepository.save(user);
    }

    private String generateAlphaNumericOtp(int length) {
        return UUID.randomUUID().toString()
                .replaceAll("-", "")
                .substring(0, length)
                .toUpperCase();
    }
}
