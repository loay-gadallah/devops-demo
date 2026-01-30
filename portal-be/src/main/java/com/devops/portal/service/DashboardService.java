package com.devops.portal.service;

import com.devops.portal.dto.DashboardResponse;
import com.devops.portal.model.Account;
import com.devops.portal.model.CardStatus;
import com.devops.portal.model.Transfer;
import com.devops.portal.repository.AccountRepository;
import com.devops.portal.repository.CardRepository;
import com.devops.portal.repository.TransferRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class DashboardService {

    private final AccountRepository accountRepository;
    private final CardRepository cardRepository;
    private final TransferRepository transferRepository;

    public DashboardService(AccountRepository accountRepository, CardRepository cardRepository,
                            TransferRepository transferRepository) {
        this.accountRepository = accountRepository;
        this.cardRepository = cardRepository;
        this.transferRepository = transferRepository;
    }

    public DashboardResponse getDashboard(Long userId) {
        List<Account> accounts = accountRepository.findByUserId(userId);

        BigDecimal totalBalance = accounts.stream()
                .map(Account::getBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int accountCount = accounts.size();

        long activeCardCount = cardRepository.findByUserId(userId).stream()
                .filter(c -> c.getStatus() == CardStatus.ACTIVE)
                .count();

        List<Transfer> recentTransfers = transferRepository.findByFromAccountUserIdOrderByCreatedAtDesc(userId);
        if (recentTransfers.size() > 5) {
            recentTransfers = recentTransfers.subList(0, 5);
        }

        return new DashboardResponse(totalBalance, accountCount, (int) activeCardCount, recentTransfers);
    }
}
