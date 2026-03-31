package com.lostfound.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.lostfound.entity.Item;

public interface ItemRepository extends JpaRepository<Item, Long> {
}