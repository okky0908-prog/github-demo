package com.okimoto.trello.backend.web;

import com.okimoto.trello.backend.entity.Card;
import com.okimoto.trello.backend.entity.Priority;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record CardResponse(
        UUID id,
        UUID listId,
        String title,
        String description,
        Priority priority,
        LocalDate dueDate,
        int position,
        Instant createdAt,
        Instant updatedAt) {

    public static CardResponse from(Card card) {
        return new CardResponse(
                card.getId(),
                card.getList().getId(),
                card.getTitle(),
                card.getDescription(),
                card.getPriority(),
                card.getDueDate(),
                card.getPosition(),
                card.getCreatedAt(),
                card.getUpdatedAt());
    }
}
