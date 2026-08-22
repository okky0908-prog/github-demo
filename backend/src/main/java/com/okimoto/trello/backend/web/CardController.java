package com.okimoto.trello.backend.web;

import com.okimoto.trello.backend.entity.Card;
import com.okimoto.trello.backend.entity.TaskList;
import com.okimoto.trello.backend.repository.CardRepository;
import com.okimoto.trello.backend.repository.TaskListRepository;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
public class CardController {

    private final CardRepository cardRepository;
    private final TaskListRepository taskListRepository;

    public CardController(CardRepository cardRepository, TaskListRepository taskListRepository) {
        this.cardRepository = cardRepository;
        this.taskListRepository = taskListRepository;
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

    @PostMapping("/api/lists/{listId}/cards")
    @ResponseStatus(HttpStatus.CREATED)
    public CardResponse createCard(@PathVariable UUID listId, @Valid @RequestBody CardCreateRequest request) {
        TaskList list = taskListRepository.findById(listId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "list not found: " + listId));

        int nextPosition = cardRepository.findByListIdOrderByPosition(listId).size();
        Card card = new Card(list, request.title(), nextPosition);
        card.setDescription(request.description());
        card.setPriority(request.priority());
        card.setDueDate(request.dueDate());

        return CardResponse.from(cardRepository.save(card));
    }
}
