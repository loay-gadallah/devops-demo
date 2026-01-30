package com.devops.portal.service;

import com.devops.portal.exception.ResourceNotFoundException;
import com.devops.portal.exception.UnauthorizedException;
import com.devops.portal.model.Card;
import com.devops.portal.model.CardStatus;
import com.devops.portal.repository.CardRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CardService {

    private final CardRepository cardRepository;

    public CardService(CardRepository cardRepository) {
        this.cardRepository = cardRepository;
    }

    public List<Card> getCardsByUser(Long userId) {
        return cardRepository.findByUserId(userId);
    }

    public Card getCardById(Long cardId, Long userId) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new ResourceNotFoundException("Card not found"));
        if (!card.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You do not own this card");
        }
        return card;
    }

    public Card blockCard(Long cardId, Long userId) {
        Card card = getCardById(cardId, userId);
        card.setStatus(CardStatus.BLOCKED);
        return cardRepository.save(card);
    }

    public Card unblockCard(Long cardId, Long userId) {
        Card card = getCardById(cardId, userId);
        card.setStatus(CardStatus.ACTIVE);
        return cardRepository.save(card);
    }
}
