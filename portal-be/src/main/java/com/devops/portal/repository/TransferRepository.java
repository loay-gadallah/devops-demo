package com.devops.portal.repository;

import com.devops.portal.model.Transfer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TransferRepository extends JpaRepository<Transfer, Long> {
    List<Transfer> findByFromAccountUserIdOrderByCreatedAtDesc(Long userId);
}
