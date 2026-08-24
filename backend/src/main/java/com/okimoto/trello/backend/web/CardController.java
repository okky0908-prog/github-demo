package com.okimoto.trello.backend.web;

import com.okimoto.trello.backend.entity.Card;
import com.okimoto.trello.backend.entity.TaskList;
import com.okimoto.trello.backend.repository.CardRepository;
import com.okimoto.trello.backend.repository.TaskListRepository;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
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

    @PutMapping("/api/cards/{cardId}")
    public CardResponse updateCard(@PathVariable UUID cardId, @Valid @RequestBody CardCreateRequest request) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "card not found: " + cardId));

        card.setTitle(request.title());
        card.setDescription(request.description());
        card.setPriority(request.priority());
        card.setDueDate(request.dueDate());

        return CardResponse.from(cardRepository.save(card));
    }

    @PatchMapping("/api/cards/{cardId}/position")
    @Transactional
    public CardResponse moveCard(@PathVariable UUID cardId, @Valid @RequestBody CardMoveRequest request) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "card not found: " + cardId));
        TaskList targetList = taskListRepository.findById(request.listId())
                .orElseThrow(
                        () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "list not found: " + request.listId()));

        UUID sourceListId = card.getList().getId();

        if (sourceListId.equals(request.listId())) {
            List<Card> siblings = cardRepository.findByListIdOrderByPosition(sourceListId);
            siblings.removeIf(c -> c.getId().equals(cardId));
            siblings.add(clamp(request.position(), siblings.size()), card);
            renumber(siblings);
            cardRepository.saveAll(siblings);
        } else {
            List<Card> sourceSiblings = cardRepository.findByListIdOrderByPosition(sourceListId);
            sourceSiblings.removeIf(c -> c.getId().equals(cardId));
            renumber(sourceSiblings);

            List<Card> targetSiblings = cardRepository.findByListIdOrderByPosition(request.listId());
            card.setList(targetList);
            targetSiblings.add(clamp(request.position(), targetSiblings.size()), card);
            renumber(targetSiblings);

            cardRepository.saveAll(sourceSiblings);
            cardRepository.saveAll(targetSiblings);
        }

        return CardResponse.from(card);
    }

    @DeleteMapping("/api/cards/{cardId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void deleteCard(@PathVariable UUID cardId) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "card not found: " + cardId));
        UUID listId = card.getList().getId();

        cardRepository.delete(card);

        List<Card> siblings = cardRepository.findByListIdOrderByPosition(listId);
        renumber(siblings);
        cardRepository.saveAll(siblings);
    }

    private static int clamp(int value, int maxExclusiveBound) {
        return Math.max(0, Math.min(value, maxExclusiveBound));
    }

    private static void renumber(List<Card> cards) {
        for (int i = 0; i < cards.size(); i++) {
            cards.get(i).setPosition(i);
        }
    }
}
