package com.devops.portal.controller;

import com.devops.portal.dto.DashboardResponse;
import com.devops.portal.security.AuthUtil;
import com.devops.portal.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;
    private final AuthUtil authUtil;

    public DashboardController(DashboardService dashboardService, AuthUtil authUtil) {
        this.dashboardService = dashboardService;
        this.authUtil = authUtil;
    }

    @GetMapping
    public ResponseEntity<DashboardResponse> getDashboard() {
        return ResponseEntity.ok(dashboardService.getDashboard(authUtil.getCurrentUserId()));
    }

    @GetMapping("/version")
    public ResponseEntity<java.util.Map<String, String>> getVersion() {
        return ResponseEntity.ok(java.util.Map.of(
            "version", "1.1.0",
            "name", "RetailBank Portal API"
        ));
    }
}
