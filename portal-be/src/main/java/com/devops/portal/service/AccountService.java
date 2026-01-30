package com.devops.portal.service;

import com.devops.portal.model.Account;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class AccountService {

    private final List<Account> accounts = new ArrayList<>();

    public AccountService() {
        accounts.add(new Account(1L, "ACC-1001", "Alice Johnson", 5200.00));
        accounts.add(new Account(2L, "ACC-1002", "Bob Smith", 3100.50));
        accounts.add(new Account(3L, "ACC-1003", "Carol White", 8750.25));
    }

    public List<Account> getAllAccounts() {
        return accounts;
    }

    public Optional<Account> getAccountById(Long id) {
        return accounts.stream().filter(a -> a.getId().equals(id)).findFirst();
    }
}
