package com.okimoto.trello.backend.repository;

import com.okimoto.trello.backend.entity.TaskList;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskListRepository extends JpaRepository<TaskList, UUID> {

    List<TaskList> findByBoardIdOrderByPosition(UUID boardId);
}
