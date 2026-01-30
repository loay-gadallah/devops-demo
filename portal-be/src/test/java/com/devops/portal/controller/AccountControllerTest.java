package com.devops.portal.controller;

import com.devops.portal.model.Account;
import com.devops.portal.service.AccountService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.bean.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.hamcrest.Matchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AccountController.class)
class AccountControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AccountService accountService;

    @Test
    void listAccounts_returnsAllAccounts() throws Exception {
        when(accountService.getAllAccounts()).thenReturn(List.of(
                new Account(1L, "ACC-1001", "Alice", 1000.0)
        ));

        mockMvc.perform(get("/api/accounts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name", is("Alice")));
    }

    @Test
    void getAccount_found() throws Exception {
        when(accountService.getAccountById(1L)).thenReturn(
                Optional.of(new Account(1L, "ACC-1001", "Alice", 1000.0))
        );

        mockMvc.perform(get("/api/accounts/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accountNumber", is("ACC-1001")));
    }

    @Test
    void getAccount_notFound() throws Exception {
        when(accountService.getAccountById(99L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/accounts/99"))
                .andExpect(status().isNotFound());
    }
}
