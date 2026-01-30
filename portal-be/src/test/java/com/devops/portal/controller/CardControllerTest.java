package com.devops.portal.controller;

import com.devops.portal.dto.LoginRequest;
import com.devops.portal.model.*;
import com.devops.portal.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CardControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private UserRepository userRepository;
    @Autowired private AccountRepository accountRepository;
    @Autowired private CardRepository cardRepository;
    @Autowired private TransactionRepository transactionRepository;
    @Autowired private TransferRepository transferRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    private String userToken;
    private Long cardId;

    @BeforeEach
    void setUp() throws Exception {
        transferRepository.deleteAll();
        transactionRepository.deleteAll();
        cardRepository.deleteAll();
        accountRepository.deleteAll();
        userRepository.deleteAll();

        User user = new User();
        user.setUsername("testuser");
        user.setPassword(passwordEncoder.encode("password"));
        user.setFullName("Test User");
        user.setRole(Role.USER);
        user = userRepository.save(user);

        Account account = new Account();
        account.setAccountNumber("ACC-TEST-001");
        account.setAccountName("Test Checking");
        account.setType(AccountType.CHECKING);
        account.setBalance(new BigDecimal("5000.00"));
        account.setUser(user);
        account = accountRepository.save(account);

        Card card = new Card();
        card.setCardNumber("**** **** **** 1234");
        card.setCardHolderName("Test User");
        card.setType(CardType.DEBIT);
        card.setExpiryDate("12/26");
        card.setStatus(CardStatus.ACTIVE);
        card.setDailyLimit(new BigDecimal("5000.00"));
        card.setAccount(account);
        card.setUser(user);
        card = cardRepository.save(card);
        cardId = card.getId();

        LoginRequest loginRequest = new LoginRequest("testuser", "password");
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andReturn();
        userToken = objectMapper.readTree(result.getResponse().getContentAsString()).get("token").asText();
    }

    @Test
    void listCards() throws Exception {
        mockMvc.perform(get("/api/cards")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
    }

    @Test
    void blockCard() throws Exception {
        mockMvc.perform(put("/api/cards/" + cardId + "/block")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("BLOCKED")));
    }

    @Test
    void unblockCard() throws Exception {
        // Block first
        mockMvc.perform(put("/api/cards/" + cardId + "/block")
                .header("Authorization", "Bearer " + userToken));

        mockMvc.perform(put("/api/cards/" + cardId + "/unblock")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("ACTIVE")));
    }
}
