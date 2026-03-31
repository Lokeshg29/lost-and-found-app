package com.lostfound.controller;

import com.lostfound.entity.Item;
import com.lostfound.entity.User;
import com.lostfound.repository.ItemRepository;
import com.lostfound.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/items")
@CrossOrigin(origins = "*")
public class ItemController {

    @Autowired private ItemRepository itemRepository;
    @Autowired private UserRepository userRepository;

    // GET all items
    @GetMapping
    public List<Item> getAll() {
        return itemRepository.findAll();
    }

    // POST create item (pass userId in request body)
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body) {
        try {
            Item item = new Item();
            item.setTitle((String) body.get("title"));
            item.setDescription((String) body.get("description"));
            item.setLocation((String) body.get("location"));
            item.setCategory((String) body.get("category"));

            String statusStr = (String) body.get("status");
            item.setStatus(Item.Status.valueOf(statusStr != null ? statusStr : "LOST"));

            Long userId = Long.valueOf(body.get("userId").toString());
            User user = userRepository.findById(userId).orElseThrow();
            item.setPostedBy(user);

            return ResponseEntity.ok(itemRepository.save(item));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // PUT update item
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return itemRepository.findById(id).map(item -> {
            if (body.containsKey("title")) item.setTitle((String) body.get("title"));
            if (body.containsKey("description")) item.setDescription((String) body.get("description"));
            if (body.containsKey("location")) item.setLocation((String) body.get("location"));
            if (body.containsKey("category")) item.setCategory((String) body.get("category"));
            if (body.containsKey("status"))
                item.setStatus(Item.Status.valueOf((String) body.get("status")));
            return ResponseEntity.ok(itemRepository.save(item));
        }).orElse(ResponseEntity.notFound().build());
    }

    // DELETE item
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        itemRepository.deleteById(id);
        return ResponseEntity.ok("Deleted");
    }

    // PATCH mark as RETURNED
    @PatchMapping("/{id}/returned")
    public ResponseEntity<?> markReturned(@PathVariable Long id) {
        return itemRepository.findById(id).map(item -> {
            item.setStatus(Item.Status.RETURNED);
            return ResponseEntity.ok(itemRepository.save(item));
        }).orElse(ResponseEntity.notFound().build());
    }
}