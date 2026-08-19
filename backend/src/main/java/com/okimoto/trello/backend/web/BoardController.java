package com.okimoto.trello.backend.web;

import com.okimoto.trello.backend.repository.BoardRepository;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/boards")
public class BoardController {

    private final BoardRepository boardRepository;

    public BoardController(BoardRepository boardRepository) {
        this.boardRepository = boardRepository;
    }

    @GetMapping
    public List<BoardResponse> listBoards() {
        return boardRepository.findAll().stream().map(BoardResponse::from).toList();
    }
}
