package com.lostfound.service;

import com.lostfound.entity.User;
import com.lostfound.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    // Hardcoded — no @Autowired, no @Bean dependency
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public User register(User user) {
        String raw = user.getPassword();
        System.out.println("RAW PASSWORD RECEIVED: [" + raw + "]");

        if (raw == null || raw.isEmpty()) {
            throw new RuntimeException("Password is empty — cannot register");
        }

        String hashed = encoder.encode(raw);
        System.out.println("HASHED PASSWORD: " + hashed);

        // Verify the hash works immediately
        boolean selfCheck = encoder.matches(raw, hashed);
        System.out.println("SELF CHECK (must be true): " + selfCheck);

        user.setPassword(hashed);
        User saved = userRepository.save(user);
        System.out.println("USER SAVED WITH ID: " + saved.getId());
        System.out.println("SAVED PASSWORD IN DB: " + saved.getPassword());
        return saved;
    }

    public User login(String email, String password) {
        System.out.println("LOGIN ATTEMPT — Email: " + email + " Password: [" + password + "]");

        User user = userRepository.findByEmail(email);
        if (user == null) {
            System.out.println("NO USER FOUND FOR: " + email);
            return null;
        }

        System.out.println("USER FOUND: " + user.getName());
        System.out.println("STORED HASH: " + user.getPassword());

        if (user.getPassword() == null) {
            System.out.println("PASSWORD IS NULL IN DB — this is the bug!");
            return null;
        }

        boolean match = encoder.matches(password, user.getPassword());
        System.out.println("BCRYPT MATCH: " + match);

        return match ? user : null;
    }

    public boolean emailExists(String email) {
        return userRepository.findByEmail(email) != null;
    }

    public User findById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
}