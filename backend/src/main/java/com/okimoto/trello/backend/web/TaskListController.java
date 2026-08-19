package com.okimoto.trello.backend.web;

import com.okimoto.trello.backend.repository.TaskListRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/boards/{boardId}/lists")
public class TaskListController {

    private final TaskListRepository taskListRepository;

    public TaskListController(TaskListRepository taskListRepository) {
        this.taskListRepository = taskListRepository;
    }

    @GetMapping
    public List<ListResponse> listLists(@PathVariable UUID boardId) {
        return taskListRepository.findByBoardIdOrderByPosition(boardId).stream()
                .map(ListResponse::from)
                .toList();
    }
}
