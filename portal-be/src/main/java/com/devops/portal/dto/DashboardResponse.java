package com.devops.portal.dto;

import com.devops.portal.model.Transfer;
import java.math.BigDecimal;
import java.util.List;

public class DashboardResponse {

    private BigDecimal totalBalance;
    private int accountCount;
    private int activeCardCount;
    private List<Transfer> recentTransfers;

    public DashboardResponse() {}

    public DashboardResponse(BigDecimal totalBalance, int accountCount, int activeCardCount, List<Transfer> recentTransfers) {
        this.totalBalance = totalBalance;
        this.accountCount = accountCount;
        this.activeCardCount = activeCardCount;
        this.recentTransfers = recentTransfers;
    }

    public BigDecimal getTotalBalance() { return totalBalance; }
    public void setTotalBalance(BigDecimal totalBalance) { this.totalBalance = totalBalance; }

    public int getAccountCount() { return accountCount; }
    public void setAccountCount(int accountCount) { this.accountCount = accountCount; }

    public int getActiveCardCount() { return activeCardCount; }
    public void setActiveCardCount(int activeCardCount) { this.activeCardCount = activeCardCount; }

    public List<Transfer> getRecentTransfers() { return recentTransfers; }
    public void setRecentTransfers(List<Transfer> recentTransfers) { this.recentTransfers = recentTransfers; }
}
