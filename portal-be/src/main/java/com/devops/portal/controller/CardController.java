package com.devops.portal.controller;

import com.devops.portal.model.Card;
import com.devops.portal.security.AuthUtil;
import com.devops.portal.service.CardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cards")
public class CardController {

    private final CardService cardService;
    private final AuthUtil authUtil;

    public CardController(CardService cardService, AuthUtil authUtil) {
        this.cardService = cardService;
        this.authUtil = authUtil;
    }

    @GetMapping
    public ResponseEntity<List<Card>> listCards() {
        return ResponseEntity.ok(cardService.getCardsByUser(authUtil.getCurrentUserId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Card> getCard(@PathVariable Long id) {
        return ResponseEntity.ok(cardService.getCardById(id, authUtil.getCurrentUserId()));
    }

    @PutMapping("/{id}/block")
    public ResponseEntity<Card> blockCard(@PathVariable Long id) {
        return ResponseEntity.ok(cardService.blockCard(id, authUtil.getCurrentUserId()));
    }

    @PutMapping("/{id}/unblock")
    public ResponseEntity<Card> unblockCard(@PathVariable Long id) {
        return ResponseEntity.ok(cardService.unblockCard(id, authUtil.getCurrentUserId()));
    }
}
