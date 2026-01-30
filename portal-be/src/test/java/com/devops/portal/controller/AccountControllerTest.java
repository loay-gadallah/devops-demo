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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AccountControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private UserRepository userRepository;
    @Autowired private AccountRepository accountRepository;
    @Autowired private TransactionRepository transactionRepository;
    @Autowired private TransferRepository transferRepository;
    @Autowired private CardRepository cardRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    private String userToken;
    private Long accountId;

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
        accountId = account.getId();

        Transaction tx = new Transaction();
        tx.setAccount(account);
        tx.setType(TransactionType.CREDIT);
        tx.setAmount(new BigDecimal("5000.00"));
        tx.setBalanceAfter(new BigDecimal("5000.00"));
        tx.setDescription("Initial deposit");
        tx.setReference("REF-001");
        transactionRepository.save(tx);

        // Login to get token
        LoginRequest loginRequest = new LoginRequest("testuser", "password");
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andReturn();
        userToken = objectMapper.readTree(result.getResponse().getContentAsString()).get("token").asText();
    }

    @Test
    void listAccounts_authenticated() throws Exception {
        mockMvc.perform(get("/api/accounts")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].accountNumber", is("ACC-TEST-001")));
    }

    @Test
    void getAccount_detail() throws Exception {
        mockMvc.perform(get("/api/accounts/" + accountId)
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accountName", is("Test Checking")));
    }

    @Test
    void getTransactions() throws Exception {
        mockMvc.perform(get("/api/accounts/" + accountId + "/transactions")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
    }

    @Test
    void unauthorized_access() throws Exception {
        mockMvc.perform(get("/api/accounts"))
                .andExpect(status().isUnauthorized());
    }
}
