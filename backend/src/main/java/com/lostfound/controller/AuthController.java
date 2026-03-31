package com.lostfound.controller;

import com.lostfound.entity.User;
import com.lostfound.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        try {
            String name     = body.get("name");
            String email    = body.get("email");
            String password = body.get("password");

            System.out.println("=== REGISTER ===");
            System.out.println("Name: "     + name);
            System.out.println("Email: "    + email);
            System.out.println("Password: " + password);

            if (name == null || email == null || password == null) {
                return ResponseEntity.badRequest()
                    .body("Name, email and password are all required");
            }

            if (password.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Password cannot be empty");
            }

            if (userService.emailExists(email)) {
                return ResponseEntity.badRequest().body("Email already registered");
            }

            User user = new User();
            user.setName(name);
            user.setEmail(email);
            user.setPassword(password);
            user.setRole("USER");

            User saved = userService.register(user);
            return ResponseEntity.ok(saved);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest()
                .body("Registration failed: " + e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        try {
            String email    = body.get("email");
            String password = body.get("password");

            System.out.println("=== LOGIN ===");
            System.out.println("Email: "    + email);
            System.out.println("Password: " + password);

            if (email == null || password == null) {
                return ResponseEntity.badRequest()
                    .body("Email and password are required");
            }

            User found = userService.login(email.trim(), password);

            if (found != null) {
                System.out.println("Login SUCCESS: " + found.getName());
                return ResponseEntity.ok(found);
            }

            System.out.println("Login FAILED — wrong credentials");
            return ResponseEntity.status(401).body("Invalid email or password");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                .body("Server error: " + e.getMessage());
        }
    }
}