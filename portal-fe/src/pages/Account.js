import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBriefcase } from 'react-icons/fi';
import api from '../services/api';
import './Accounts.css';

const formatCurrency = (amount, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/api/accounts')
      .then((res) => setAccounts(res.data))
      .catch((err) => console.error('Failed to load accounts', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="spinner-container"><div className="spinner" /></div>;
  }

  if (accounts.length === 0) {
    return (
      <div className="card">
        <div className="empty-state">
          <div className="empty-icon"><FiBriefcase /></div>
          <h3>No accounts found</h3>
          <p>Your bank accounts will appear here once available.</p>
        </div>
      </div>
    );
  }

  const maskNumber = (num) => {
    if (!num) return '';
    return '****' + num.slice(-4);
  };

  return (
    <div className="accounts-page">
      <div className="accounts-grid">
        {accounts.map((acc) => (
          <div
            key={acc.id}
            className="account-card card"
            onClick={() => navigate(`/accounts/${acc.id}`)}
          >
            <div className="account-card-top">
              <span className="account-name">{acc.accountName || acc.name}</span>
              <span className={`badge badge-${acc.type === 'CHECKING' ? 'info' : 'success'}`}>
                {acc.type}
              </span>
            </div>
            <div className="account-number">{maskNumber(acc.accountNumber)}</div>
            <div className="account-balance">
              {formatCurrency(acc.balance, acc.currency)}
            </div>
            <div className="account-currency">{acc.currency || 'USD'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
