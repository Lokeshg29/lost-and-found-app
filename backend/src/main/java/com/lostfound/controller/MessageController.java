package com.lostfound.controller;

import com.lostfound.entity.Message;
import com.lostfound.entity.User;
import com.lostfound.repository.MessageRepository;
import com.lostfound.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "*")
public class MessageController {

    @Autowired private MessageRepository messageRepository;
    @Autowired private UserRepository userRepository;

    // Send a message
    @PostMapping("/send")
    public ResponseEntity<?> send(@RequestBody Map<String, Object> body) {
        try {
            Long senderId = Long.valueOf(body.get("senderId").toString());
            Long receiverId = Long.valueOf(body.get("receiverId").toString());
            String content = (String) body.get("content");

            User sender = userRepository.findById(senderId).orElseThrow();
            User receiver = userRepository.findById(receiverId).orElseThrow();

            Message msg = new Message();
            msg.setSender(sender);
            msg.setReceiver(receiver);
            msg.setContent(content);

            return ResponseEntity.ok(messageRepository.save(msg));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Get conversation between two users
    @GetMapping("/conversation/{userId1}/{userId2}")
    public List<Message> getConversation(@PathVariable Long userId1, @PathVariable Long userId2) {
        return messageRepository.findConversation(userId1, userId2);
    }

    // Get all messages for a user (inbox)
    @GetMapping("/inbox/{userId}")
    public List<Message> getInbox(@PathVariable Long userId) {
        return messageRepository.findByReceiverId(userId);
    }
}