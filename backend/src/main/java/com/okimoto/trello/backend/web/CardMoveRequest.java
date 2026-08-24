package com.okimoto.trello.backend.web;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.util.UUID;

public record CardMoveRequest(@NotNull UUID listId, @PositiveOrZero int position) {
}
