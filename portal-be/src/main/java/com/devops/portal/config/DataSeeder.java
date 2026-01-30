package com.devops.portal.config;

import com.devops.portal.model.*;
import com.devops.portal.repository.*;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.UUID;

@Component
@ConditionalOnProperty(name = "app.seed-data", havingValue = "true", matchIfMissing = true)
public class DataSeeder implements ApplicationRunner {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final CardRepository cardRepository;
    private final TransferRepository transferRepository;
    private final TransactionRepository transactionRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, AccountRepository accountRepository,
                      CardRepository cardRepository, TransferRepository transferRepository,
                      TransactionRepository transactionRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.accountRepository = accountRepository;
        this.cardRepository = cardRepository;
        this.transferRepository = transferRepository;
        this.transactionRepository = transactionRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (userRepository.count() > 0) {
            return;
        }

        // Admin user
        User admin = new User();
        admin.setUsername("admin");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setFullName("System Administrator");
        admin.setEmail("admin@portal.com");
        admin.setRole(Role.ADMIN);
        admin = userRepository.save(admin);

        // Demo user
        User demo = new User();
        demo.setUsername("demo");
        demo.setPassword(passwordEncoder.encode("demo123"));
        demo.setFullName("John Demo");
        demo.setEmail("demo@portal.com");
        demo.setRole(Role.USER);
        demo = userRepository.save(demo);

        // Demo user accounts
        Account checking = new Account();
        checking.setAccountNumber("ACC-100001");
        checking.setAccountName("Primary Checking");
        checking.setType(AccountType.CHECKING);
        checking.setCurrency("USD");
        checking.setBalance(new BigDecimal("12450.00"));
        checking.setUser(demo);
        checking = accountRepository.save(checking);

        Account savings1 = new Account();
        savings1.setAccountNumber("ACC-100002");
        savings1.setAccountName("Savings Account");
        savings1.setType(AccountType.SAVINGS);
        savings1.setCurrency("USD");
        savings1.setBalance(new BigDecimal("45200.50"));
        savings1.setUser(demo);
        savings1 = accountRepository.save(savings1);

        Account savings2 = new Account();
        savings2.setAccountNumber("ACC-100003");
        savings2.setAccountName("Euro Savings");
        savings2.setType(AccountType.SAVINGS);
        savings2.setCurrency("EUR");
        savings2.setBalance(new BigDecimal("8300.00"));
        savings2.setUser(demo);
        savings2 = accountRepository.save(savings2);

        // Demo user cards
        Card card1 = new Card();
        card1.setCardNumber("**** **** **** 4521");
        card1.setCardHolderName("John Demo");
        card1.setType(CardType.DEBIT);
        card1.setExpiryDate("12/26");
        card1.setStatus(CardStatus.ACTIVE);
        card1.setDailyLimit(new BigDecimal("5000.00"));
        card1.setAccount(checking);
        card1.setUser(demo);
        cardRepository.save(card1);

        Card card2 = new Card();
        card2.setCardNumber("**** **** **** 8834");
        card2.setCardHolderName("John Demo");
        card2.setType(CardType.CREDIT);
        card2.setExpiryDate("09/27");
        card2.setStatus(CardStatus.ACTIVE);
        card2.setDailyLimit(new BigDecimal("10000.00"));
        card2.setAccount(checking);
        card2.setUser(demo);
        cardRepository.save(card2);

        // Sample transactions on checking account
        createTransaction(checking, TransactionType.CREDIT, new BigDecimal("3500.00"), new BigDecimal("15950.00"), "Salary deposit");
        createTransaction(checking, TransactionType.DEBIT, new BigDecimal("120.50"), new BigDecimal("15829.50"), "Grocery store");
        createTransaction(checking, TransactionType.DEBIT, new BigDecimal("2500.00"), new BigDecimal("13329.50"), "Rent payment");
        createTransaction(checking, TransactionType.CREDIT, new BigDecimal("250.00"), new BigDecimal("13579.50"), "Refund");
        createTransaction(checking, TransactionType.DEBIT, new BigDecimal("1129.50"), new BigDecimal("12450.00"), "Online purchase");

        // Sample transfers
        Transfer t1 = new Transfer();
        t1.setFromAccount(checking);
        t1.setToAccountNumber("EXT-200001");
        t1.setBeneficiaryName("Jane Smith");
        t1.setAmount(new BigDecimal("500.00"));
        t1.setCurrency("USD");
        t1.setType(TransferType.LOCAL);
        t1.setStatus(TransferStatus.COMPLETED);
        t1.setReference(UUID.randomUUID().toString());
        t1.setDescription("Monthly payment");
        transferRepository.save(t1);

        Transfer t2 = new Transfer();
        t2.setFromAccount(checking);
        t2.setToAccountNumber("INTL-300001");
        t2.setBeneficiaryName("Global Corp Ltd");
        t2.setAmount(new BigDecimal("1200.00"));
        t2.setCurrency("USD");
        t2.setType(TransferType.INTERNATIONAL);
        t2.setStatus(TransferStatus.COMPLETED);
        t2.setReference(UUID.randomUUID().toString());
        t2.setDescription("Invoice payment");
        transferRepository.save(t2);

        Transfer t3 = new Transfer();
        t3.setFromAccount(checking);
        t3.setToAccountNumber("ACC-100002");
        t3.setBeneficiaryName("John Demo");
        t3.setAmount(new BigDecimal("2000.00"));
        t3.setCurrency("USD");
        t3.setType(TransferType.INTERNAL);
        t3.setStatus(TransferStatus.COMPLETED);
        t3.setReference(UUID.randomUUID().toString());
        t3.setDescription("Move to savings");
        transferRepository.save(t3);

        // Admin account and card
        Account adminChecking = new Account();
        adminChecking.setAccountNumber("ACC-900001");
        adminChecking.setAccountName("Admin Checking");
        adminChecking.setType(AccountType.CHECKING);
        adminChecking.setCurrency("USD");
        adminChecking.setBalance(new BigDecimal("50000.00"));
        adminChecking.setUser(admin);
        adminChecking = accountRepository.save(adminChecking);

        Card adminCard = new Card();
        adminCard.setCardNumber("**** **** **** 9999");
        adminCard.setCardHolderName("System Administrator");
        adminCard.setType(CardType.DEBIT);
        adminCard.setExpiryDate("06/28");
        adminCard.setStatus(CardStatus.ACTIVE);
        adminCard.setDailyLimit(new BigDecimal("50000.00"));
        adminCard.setAccount(adminChecking);
        adminCard.setUser(admin);
        cardRepository.save(adminCard);
    }

    private void createTransaction(Account account, TransactionType type, BigDecimal amount,
                                   BigDecimal balanceAfter, String description) {
        Transaction tx = new Transaction();
        tx.setAccount(account);
        tx.setType(type);
        tx.setAmount(amount);
        tx.setBalanceAfter(balanceAfter);
        tx.setDescription(description);
        tx.setReference(UUID.randomUUID().toString());
        transactionRepository.save(tx);
    }
}
