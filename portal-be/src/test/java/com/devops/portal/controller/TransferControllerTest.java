package com.devops.portal.controller;

import com.devops.portal.dto.LoginRequest;
import com.devops.portal.dto.TransferRequest;
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
class TransferControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private UserRepository userRepository;
    @Autowired private AccountRepository accountRepository;
    @Autowired private CardRepository cardRepository;
    @Autowired private TransactionRepository transactionRepository;
    @Autowired private TransferRepository transferRepository;
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
        account.setBalance(new BigDecimal("10000.00"));
        account.setUser(user);
        account = accountRepository.save(account);
        accountId = account.getId();

        LoginRequest loginRequest = new LoginRequest("testuser", "password");
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andReturn();
        userToken = objectMapper.readTree(result.getResponse().getContentAsString()).get("token").asText();
    }

    @Test
    void createTransfer() throws Exception {
        TransferRequest request = new TransferRequest();
        request.setFromAccountId(accountId);
        request.setToAccountNumber("EXT-001");
        request.setBeneficiaryName("Jane Doe");
        request.setAmount(new BigDecimal("500.00"));
        request.setCurrency("USD");
        request.setType("LOCAL");
        request.setDescription("Test transfer");

        mockMvc.perform(post("/api/transfers")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.amount", is(500.00)))
                .andExpect(jsonPath("$.status", is("COMPLETED")));
    }

    @Test
    void listTransfers() throws Exception {
        mockMvc.perform(get("/api/transfers")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }
}
