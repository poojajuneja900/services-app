package com.example.serviceapp.service;

import com.example.serviceapp.dto.AuthResponse;
import com.example.serviceapp.dto.LoginRequest;
import com.example.serviceapp.dto.RegisterRequest;
import com.example.serviceapp.entity.User;
import com.example.serviceapp.exception.ResourceNotFoundException;
import com.example.serviceapp.repository.UserRepository;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    // ── Auth endpoints ─────────────────────────────────────────────────────────

    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("Email already in use: " + req.getEmail());
        }
        User user = new User();
        user.setName(req.getName());
        user.setEmail(req.getEmail());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setUserType(req.getUserType() != null ? req.getUserType() : "customer");
        User saved = userRepository.save(user);
        return toAuthResponse(saved, "Registration successful");
    }

    public AuthResponse login(LoginRequest req, HttpSession session) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));
        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }
        session.setAttribute("userId", user.getId());
        session.setAttribute("userType", user.getUserType());
        return toAuthResponse(user, "Login successful");
    }

    public String logout(HttpSession session) {
        session.invalidate();
        return "Logged out successfully";
    }

    // ── CRUD ───────────────────────────────────────────────────────────────────

    public List<User> getAll() {
        return userRepository.findAll();
    }

    public User getById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    public User create(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("Email already in use: " + user.getEmail());
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public User update(Long id, User updated) {
        User existing = getById(id);
        existing.setName(updated.getName());
        existing.setEmail(updated.getEmail());
        if (updated.getUserType() != null) {
            existing.setUserType(updated.getUserType());
        }
        return userRepository.save(existing);
    }

    public void delete(Long id) {
        User existing = getById(id);
        userRepository.delete(existing);
    }

    // ── Helper ─────────────────────────────────────────────────────────────────

    private AuthResponse toAuthResponse(User user, String message) {
        return new AuthResponse(user.getId(), user.getName(), user.getEmail(), user.getUserType(), message);
    }
}
