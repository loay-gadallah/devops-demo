package com.devops.portal.service;

import com.devops.portal.dto.TransferRequest;
import com.devops.portal.exception.ResourceNotFoundException;
import com.devops.portal.exception.UnauthorizedException;
import com.devops.portal.model.*;
import com.devops.portal.repository.AccountRepository;
import com.devops.portal.repository.TransactionRepository;
import com.devops.portal.repository.TransferRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class TransferService {

    private final TransferRepository transferRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;

    public TransferService(TransferRepository transferRepository, AccountRepository accountRepository,
                           TransactionRepository transactionRepository) {
        this.transferRepository = transferRepository;
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
    }

    public List<Transfer> getTransfersByUser(Long userId) {
        return transferRepository.findByFromAccountUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public Transfer createTransfer(TransferRequest request, Long userId) {
        Account fromAccount = accountRepository.findById(request.getFromAccountId())
                .orElseThrow(() -> new ResourceNotFoundException("Source account not found"));

        if (!fromAccount.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You do not own this account");
        }

        if (fromAccount.getBalance().compareTo(request.getAmount()) < 0) {
            throw new IllegalArgumentException("Insufficient balance");
        }

        Transfer transfer = new Transfer();
        transfer.setFromAccount(fromAccount);
        transfer.setToAccountNumber(request.getToAccountNumber());
        transfer.setBeneficiaryName(request.getBeneficiaryName());
        transfer.setAmount(request.getAmount());
        transfer.setCurrency(request.getCurrency() != null ? request.getCurrency() : fromAccount.getCurrency());
        transfer.setType(TransferType.valueOf(request.getType()));
        transfer.setReference(UUID.randomUUID().toString());
        transfer.setDescription(request.getDescription());
        transfer.setStatus(TransferStatus.COMPLETED);

        // Debit from source account
        fromAccount.setBalance(fromAccount.getBalance().subtract(request.getAmount()));
        accountRepository.save(fromAccount);

        // Create debit transaction
        Transaction debitTx = new Transaction();
        debitTx.setAccount(fromAccount);
        debitTx.setType(TransactionType.DEBIT);
        debitTx.setAmount(request.getAmount());
        debitTx.setBalanceAfter(fromAccount.getBalance());
        debitTx.setDescription(request.getDescription() != null ? request.getDescription() : "Transfer to " + request.getToAccountNumber());
        debitTx.setReference(transfer.getReference());
        transactionRepository.save(debitTx);

        // For INTERNAL transfers, credit the destination account
        if (transfer.getType() == TransferType.INTERNAL) {
            accountRepository.findByAccountNumber(request.getToAccountNumber()).ifPresent(toAccount -> {
                toAccount.setBalance(toAccount.getBalance().add(request.getAmount()));
                accountRepository.save(toAccount);

                Transaction creditTx = new Transaction();
                creditTx.setAccount(toAccount);
                creditTx.setType(TransactionType.CREDIT);
                creditTx.setAmount(request.getAmount());
                creditTx.setBalanceAfter(toAccount.getBalance());
                creditTx.setDescription("Transfer from " + fromAccount.getAccountNumber());
                creditTx.setReference(transfer.getReference());
                transactionRepository.save(creditTx);
            });
        }

        return transferRepository.save(transfer);
    }
}
