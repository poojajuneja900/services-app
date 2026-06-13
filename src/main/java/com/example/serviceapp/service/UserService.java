package com.example.serviceapp.service;

import com.example.serviceapp.entity.User;
import com.example.serviceapp.exception.ResourceNotFoundException;
import com.example.serviceapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

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
        return userRepository.save(user);
    }

    public User update(Long id, User updated) {
        User existing = getById(id);
        existing.setName(updated.getName());
        existing.setEmail(updated.getEmail());
        return userRepository.save(existing);
    }

    public void delete(Long id) {
        User existing = getById(id);
        userRepository.delete(existing);
    }
}
