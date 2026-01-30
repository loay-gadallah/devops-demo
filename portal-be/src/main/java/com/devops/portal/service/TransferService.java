package com.devops.portal.service;

import com.devops.portal.model.Transfer;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class TransferService {

    private final List<Transfer> transfers = new ArrayList<>();
    private final AtomicLong idCounter = new AtomicLong(1);

    public List<Transfer> getAllTransfers() {
        return transfers;
    }

    public Transfer createTransfer(Transfer transfer) {
        transfer.setId(idCounter.getAndIncrement());
        transfer.setTimestamp(LocalDateTime.now());
        transfers.add(transfer);
        return transfer;
    }
}
