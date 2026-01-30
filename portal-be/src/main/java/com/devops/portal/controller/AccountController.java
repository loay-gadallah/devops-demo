package com.devops.portal.controller;

import com.devops.portal.model.Account;
import com.devops.portal.model.Transaction;
import com.devops.portal.security.AuthUtil;
import com.devops.portal.service.AccountService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    private final AccountService accountService;
    private final AuthUtil authUtil;

    public AccountController(AccountService accountService, AuthUtil authUtil) {
        this.accountService = accountService;
        this.authUtil = authUtil;
    }

    @GetMapping
    public ResponseEntity<List<Account>> listAccounts() {
        return ResponseEntity.ok(accountService.getAccountsByUser(authUtil.getCurrentUserId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Account> getAccount(@PathVariable Long id) {
        return ResponseEntity.ok(accountService.getAccountById(id, authUtil.getCurrentUserId()));
    }

    @GetMapping("/{id}/transactions")
    public ResponseEntity<List<Transaction>> getTransactions(@PathVariable Long id) {
        return ResponseEntity.ok(accountService.getTransactions(id, authUtil.getCurrentUserId()));
    }
}
