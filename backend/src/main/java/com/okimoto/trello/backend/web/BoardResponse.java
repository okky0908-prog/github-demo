package com.okimoto.trello.backend.web;

import com.okimoto.trello.backend.entity.Board;
import java.time.Instant;
import java.util.UUID;

public record BoardResponse(UUID id, String name, Instant createdAt, Instant updatedAt) {

    public static BoardResponse from(Board board) {
        return new BoardResponse(board.getId(), board.getName(), board.getCreatedAt(), board.getUpdatedAt());
    }
}
