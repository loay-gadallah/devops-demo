package com.devops.portal.controller;

import com.devops.portal.dto.TransferRequest;
import com.devops.portal.model.Transfer;
import com.devops.portal.security.AuthUtil;
import com.devops.portal.service.TransferService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transfers")
public class TransferController {

    private final TransferService transferService;
    private final AuthUtil authUtil;

    public TransferController(TransferService transferService, AuthUtil authUtil) {
        this.transferService = transferService;
        this.authUtil = authUtil;
    }

    @GetMapping
    public ResponseEntity<List<Transfer>> listTransfers() {
        return ResponseEntity.ok(transferService.getTransfersByUser(authUtil.getCurrentUserId()));
    }

    @PostMapping
    public ResponseEntity<Transfer> createTransfer(@Valid @RequestBody TransferRequest request) {
        Transfer transfer = transferService.createTransfer(request, authUtil.getCurrentUserId());
        return ResponseEntity.status(HttpStatus.CREATED).body(transfer);
    }
}
