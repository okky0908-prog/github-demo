package com.okimoto.trello.backend.repository;

import com.okimoto.trello.backend.entity.Board;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BoardRepository extends JpaRepository<Board, UUID> {
}
