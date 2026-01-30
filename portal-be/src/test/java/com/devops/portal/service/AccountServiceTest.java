package com.devops.portal.service;

import com.devops.portal.model.Account;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

class AccountServiceTest {

    private AccountService accountService;

    @BeforeEach
    void setUp() {
        accountService = new AccountService();
    }

    @Test
    void getAllAccounts_returnsSeededData() {
        List<Account> accounts = accountService.getAllAccounts();
        assertEquals(3, accounts.size());
    }

    @Test
    void getAccountById_found() {
        Optional<Account> account = accountService.getAccountById(1L);
        assertTrue(account.isPresent());
        assertEquals("Alice Johnson", account.get().getName());
    }

    @Test
    void getAccountById_notFound() {
        Optional<Account> account = accountService.getAccountById(999L);
        assertTrue(account.isEmpty());
    }
}
