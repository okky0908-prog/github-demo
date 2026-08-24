package com.okimoto.trello.backend.web;

import static org.hamcrest.Matchers.notNullValue;

import com.okimoto.trello.backend.entity.Priority;
import java.time.LocalDate;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class CardControllerTest {

    private static final UUID SEED_LIST_ID = UUID.fromString("22222222-2222-2222-2222-222222222221");
    private static final UUID SEED_CARD_ID = UUID.fromString("33333333-3333-3333-3333-333333333331");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void createCard_タイトルのみで作成でき一覧に反映される() throws Exception {
        String requestBody = objectMapper.writeValueAsString(new CardCreateRequest("新しいタスク", null, null, null));

        mockMvc.perform(MockMvcRequestBuilders.post("/api/lists/{listId}/cards", SEED_LIST_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(MockMvcResultMatchers.status().isCreated())
                .andExpect(MockMvcResultMatchers.jsonPath("$.id").value(notNullValue()))
                .andExpect(MockMvcResultMatchers.jsonPath("$.listId").value(SEED_LIST_ID.toString()))
                .andExpect(MockMvcResultMatchers.jsonPath("$.title").value("新しいタスク"));

        mockMvc.perform(MockMvcRequestBuilders.get("/api/lists/{listId}/cards", SEED_LIST_ID))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$[?(@.title == '新しいタスク')]").exists());
    }

    @Test
    void createCard_タイトルが空だと400() throws Exception {
        String requestBody = objectMapper.writeValueAsString(new CardCreateRequest("", null, null, null));

        mockMvc.perform(MockMvcRequestBuilders.post("/api/lists/{listId}/cards", SEED_LIST_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(MockMvcResultMatchers.status().isBadRequest());
    }

    @Test
    void createCard_存在しないリストIDだと404() throws Exception {
        String requestBody = objectMapper.writeValueAsString(new CardCreateRequest("新しいタスク", null, null, null));

        mockMvc.perform(MockMvcRequestBuilders.post("/api/lists/{listId}/cards", UUID.randomUUID())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(MockMvcResultMatchers.status().isNotFound());
    }

    @Test
    void updateCard_優先度と期限を変更できる() throws Exception {
        String requestBody = objectMapper.writeValueAsString(
                new CardCreateRequest("更新後タイトル", "更新後の説明", Priority.LOW, LocalDate.of(2026, 9, 1)));

        mockMvc.perform(MockMvcRequestBuilders.put("/api/cards/{cardId}", SEED_CARD_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.id").value(SEED_CARD_ID.toString()))
                .andExpect(MockMvcResultMatchers.jsonPath("$.title").value("更新後タイトル"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.description").value("更新後の説明"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.priority").value("LOW"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.dueDate").value("2026-09-01"));
    }

    @Test
    void updateCard_タイトルが空だと400() throws Exception {
        String requestBody = objectMapper.writeValueAsString(new CardCreateRequest("", null, null, null));

        mockMvc.perform(MockMvcRequestBuilders.put("/api/cards/{cardId}", SEED_CARD_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(MockMvcResultMatchers.status().isBadRequest());
    }

    @Test
    void updateCard_存在しないカードIDだと404() throws Exception {
        String requestBody = objectMapper.writeValueAsString(new CardCreateRequest("更新後タイトル", null, null, null));

        mockMvc.perform(MockMvcRequestBuilders.put("/api/cards/{cardId}", UUID.randomUUID())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(MockMvcResultMatchers.status().isNotFound());
    }
}
