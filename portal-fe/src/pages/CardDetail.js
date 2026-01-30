import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import api from '../services/api';
import './CardDetail.css';

export default function CardDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCard = () => {
    api.get(`/api/cards/${id}`)
      .then((res) => setCard(res.data))
      .catch((err) => console.error('Failed to load card', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCard(); }, [id]);

  const toggleBlock = async () => {
    try {
      const action = card.status === 'ACTIVE' ? 'block' : 'unblock';
      await api.post(`/api/cards/${card.id}/${action}`);
      fetchCard();
    } catch (err) {
      console.error('Failed to update card', err);
    }
  };

  if (loading) {
    return <div className="spinner-container"><div className="spinner" /></div>;
  }

  if (!card) {
    return (
      <div className="card">
        <div className="empty-state">
          <h3>Card not found</h3>
          <button className="btn btn-primary" onClick={() => navigate('/cards')}>Back to Cards</button>
        </div>
      </div>
    );
  }

  const maskCard = (num) => {
    if (!num) return '**** **** **** ****';
    return `**** **** **** ${num.slice(-4)}`;
  };

  return (
    <div className="card-detail-page">
      <button className="btn btn-secondary btn-sm back-btn" onClick={() => navigate('/cards')}>
        <FiArrowLeft /> Back to Cards
      </button>

      <div className={`visual-card large ${card.type === 'CREDIT' ? 'credit' : 'debit'}`}>
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

      <div className="card card-info-section">
        <h3>Card Details</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Card Holder</span>
            <span className="info-value">{card.cardHolderName}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Card Number</span>
            <span className="info-value">{maskCard(card.cardNumber)}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Expiry Date</span>
            <span className="info-value">{card.expiryDate}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Type</span>
            <span className="info-value">{card.type}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Daily Limit</span>
            <span className="info-value">
              {card.dailyLimit ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(card.dailyLimit) : 'N/A'}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Linked Account</span>
            <span className="info-value">{card.linkedAccountNumber || 'N/A'}</span>
          </div>
        </div>

        <button
          className={`btn ${card.status === 'ACTIVE' ? 'btn-danger' : 'btn-primary'}`}
          onClick={toggleBlock}
          style={{ marginTop: 24 }}
        >
          {card.status === 'ACTIVE' ? 'Block Card' : 'Unblock Card'}
        </button>
      </div>
    </div>
  );
}
