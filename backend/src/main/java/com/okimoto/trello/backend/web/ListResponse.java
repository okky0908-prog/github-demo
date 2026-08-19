package com.okimoto.trello.backend.web;

import com.okimoto.trello.backend.entity.TaskList;
import java.time.Instant;
import java.util.UUID;

public record ListResponse(UUID id, UUID boardId, String title, int position, Instant createdAt, Instant updatedAt) {

    public static ListResponse from(TaskList list) {
        return new ListResponse(
                list.getId(),
                list.getBoard().getId(),
                list.getTitle(),
                list.getPosition(),
                list.getCreatedAt(),
                list.getUpdatedAt());
    }
}
