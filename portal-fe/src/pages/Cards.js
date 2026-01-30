import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCreditCard } from 'react-icons/fi';
import api from '../services/api';
import './Cards.css';

export default function Cards() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCards = () => {
    api.get('/api/cards')
      .then((res) => setCards(res.data))
      .catch((err) => console.error('Failed to load cards', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCards(); }, []);

  const toggleBlock = async (e, card) => {
    e.stopPropagation();
    try {
      const action = card.status === 'ACTIVE' ? 'block' : 'unblock';
      await api.post(`/api/cards/${card.id}/${action}`);
      fetchCards();
    } catch (err) {
      console.error('Failed to update card status', err);
    }
  };

  if (loading) {
    return <div className="spinner-container"><div className="spinner" /></div>;
  }

  if (cards.length === 0) {
    return (
      <div className="card">
        <div className="empty-state">
          <div className="empty-icon"><FiCreditCard /></div>
          <h3>No cards found</h3>
          <p>Your cards will appear here once issued.</p>
        </div>
      </div>
    );
  }

  const maskCard = (num) => {
    if (!num) return '**** **** **** ****';
    const last4 = num.slice(-4);
    return `**** **** **** ${last4}`;
  };

  return (
    <div className="cards-page">
      <div className="cards-grid">
        {cards.map((card) => (
          <div key={card.id} className="visual-card-wrapper" onClick={() => navigate(`/cards/${card.id}`)}>
            <div className={`visual-card ${card.type === 'CREDIT' ? 'credit' : 'debit'}`}>
              <div className="visual-card-top">
                <span className="card-type-label">{card.type}</span>
                <span className={`badge badge-${card.status === 'ACTIVE' ? 'success' : 'danger'}`}>
                  {card.status}
                </span>
              </div>
              <div className="visual-card-number">{maskCard(card.cardNumber)}</div>
              <div className="visual-card-bottom">
                <div>
                  <div className="card-detail-label">Card Holder</div>
                  <div className="card-detail-value">{card.cardHolderName}</div>
                </div>
                <div>
                  <div className="card-detail-label">Expires</div>
                  <div className="card-detail-value">{card.expiryDate}</div>
                </div>
              </div>
            </div>
            <button
              className={`btn btn-sm ${card.status === 'ACTIVE' ? 'btn-danger' : 'btn-primary'}`}
              onClick={(e) => toggleBlock(e, card)}
              style={{ marginTop: 12, width: '100%' }}
            >
              {card.status === 'ACTIVE' ? 'Block Card' : 'Unblock Card'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
