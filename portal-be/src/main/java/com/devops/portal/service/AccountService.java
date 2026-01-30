package com.devops.portal.service;

import com.devops.portal.exception.ResourceNotFoundException;
import com.devops.portal.exception.UnauthorizedException;
import com.devops.portal.model.Account;
import com.devops.portal.model.Transaction;
import com.devops.portal.repository.AccountRepository;
import com.devops.portal.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AccountService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;

    public AccountService(AccountRepository accountRepository, TransactionRepository transactionRepository) {
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
    }

    public List<Account> getAccountsByUser(Long userId) {
        return accountRepository.findByUserId(userId);
    }

    public Account getAccountById(Long accountId, Long userId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
        if (!account.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You do not own this account");
        }
        return account;
    }

    public List<Transaction> getTransactions(Long accountId, Long userId) {
        Account account = getAccountById(accountId, userId);
        return transactionRepository.findByAccountIdOrderByCreatedAtDesc(account.getId());
    }
}
