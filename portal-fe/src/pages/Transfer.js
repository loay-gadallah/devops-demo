import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSend, FiPlus } from 'react-icons/fi';
import api from '../services/api';
import './Transfers.css';

const formatCurrency = (amount, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);

const formatDate = (dateStr) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(dateStr));

export default function Transfers() {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/api/transfers')
      .then((res) => setTransfers(res.data.content || res.data || []))
      .catch((err) => console.error('Failed to load transfers', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="spinner-container"><div className="spinner" /></div>;
  }

  return (
    <div className="transfers-page">
      <div className="section-header">
        <h3>Transfer History</h3>
        <button className="btn btn-primary" onClick={() => navigate('/transfers/new')}>
          <FiPlus /> New Transfer
        </button>
      </div>

      {transfers.length > 0 ? (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Beneficiary</th>
                <th>To Account</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Status</th>
                <th>Reference</th>
              </tr>
            </thead>
            <tbody>
              {transfers.map((t) => (
                <tr key={t.id}>
                  <td>{formatDate(t.createdAt || t.date)}</td>
                  <td>{t.beneficiaryName || '-'}</td>
                  <td style={{ fontFamily: "'SF Mono', monospace", fontSize: 13 }}>
                    {t.toAccountNumber}
                  </td>
                  <td style={{ fontWeight: 600 }}>{formatCurrency(t.amount, t.currency)}</td>
                  <td><span className="badge badge-info">{t.type}</span></td>
                  <td>
                    <span className={`badge badge-${t.status === 'COMPLETED' ? 'success' : t.status === 'FAILED' ? 'danger' : 'warning'}`}>
                      {t.status}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--gray-500)' }}>{t.reference || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon"><FiSend /></div>
            <h3>No transfers yet</h3>
            <p>Create your first transfer to get started.</p>
          </div>
        </div>
      )}
    </div>
  );
}
