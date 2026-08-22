package com.okimoto.trello.backend.web;

import com.okimoto.trello.backend.entity.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record CardCreateRequest(
        @NotBlank @Size(max = 255) String title,
        String description,
        Priority priority,
        LocalDate dueDate) {
}
