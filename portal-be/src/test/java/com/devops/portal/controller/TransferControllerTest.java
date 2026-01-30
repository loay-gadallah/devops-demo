package com.devops.portal.controller;

import com.devops.portal.model.Transfer;
import com.devops.portal.service.TransferService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.bean.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TransferController.class)
class TransferControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private TransferService transferService;

    @Test
    void listTransfers_returnsAll() throws Exception {
        when(transferService.getAllTransfers()).thenReturn(List.of(
                new Transfer(1L, "ACC-1001", "ACC-1002", 100.0, LocalDateTime.now())
        ));

        mockMvc.perform(get("/api/transfers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
    }

    @Test
    void createTransfer_returnsCreated() throws Exception {
        Transfer input = new Transfer(null, "ACC-1001", "ACC-1002", 250.0, null);
        Transfer saved = new Transfer(1L, "ACC-1001", "ACC-1002", 250.0, LocalDateTime.now());

        when(transferService.createTransfer(any(Transfer.class))).thenReturn(saved);

        mockMvc.perform(post("/api/transfers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(input)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.amount", is(250.0)));
    }
}
