package com.okimoto.trello.backend.repository;

import com.okimoto.trello.backend.entity.Card;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CardRepository extends JpaRepository<Card, UUID> {

    List<Card> findByListIdOrderByPosition(UUID listId);
}
