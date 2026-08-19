package com.okimoto.trello.backend.web;

import com.okimoto.trello.backend.repository.CardRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class CardController {

    private final CardRepository cardRepository;

    public CardController(CardRepository cardRepository) {
        this.cardRepository = cardRepository;
    }

    @GetMapping("/api/cards")
    public List<CardResponse> listAllCards() {
        return cardRepository.findAll().stream().map(CardResponse::from).toList();
    }

    @GetMapping("/api/lists/{listId}/cards")
    public List<CardResponse> listCardsByList(@PathVariable UUID listId) {
        return cardRepository.findByListIdOrderByPosition(listId).stream()
                .map(CardResponse::from)
                .toList();
    }
}
