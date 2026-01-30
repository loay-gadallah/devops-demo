import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiDollarSign, FiBriefcase, FiCreditCard, FiSend, FiArrowRight } from 'react-icons/fi';
import api from '../services/api';
import './Dashboard.css';

const formatCurrency = (amount, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);

const formatDate = (dateStr) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(dateStr));

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, transfersRes] = await Promise.all([
          api.get('/api/dashboard/stats'),
          api.get('/api/transfers?limit=5'),
        ]);
        setStats(statsRes.data);
        setTransfers(transfersRes.data.content || transfersRes.data || []);
      } catch (err) {
        console.error('Failed to load dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner" />
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Balance',
      value: formatCurrency(stats?.totalBalance || 0),
      icon: FiDollarSign,
      color: '#0096c7',
      bg: 'rgba(0, 150, 199, 0.1)',
    },
    {
      label: 'Accounts',
      value: stats?.accountCount ?? 0,
      icon: FiBriefcase,
      color: '#06d6a0',
      bg: 'rgba(6, 214, 160, 0.1)',
    },
    {
      label: 'Active Cards',
      value: stats?.activeCards ?? 0,
      icon: FiCreditCard,
      color: '#7c3aed',
      bg: 'rgba(124, 58, 237, 0.1)',
    },
    {
      label: 'Pending Transfers',
      value: stats?.pendingTransfers ?? 0,
      icon: FiSend,
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.1)',
    },
  ];

  return (
    <div className="dashboard">
      <div className="stats-grid">
        {statCards.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}>
              <s.icon />
            </div>
            <div className="stat-info">
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h3>Recent Transfers</h3>
          <div className="section-actions">
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/transfers/new')}>
              New Transfer
            </button>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/accounts')}>
              View Accounts <FiArrowRight />
            </button>
          </div>
        </div>

        {transfers.length > 0 ? (
          <div className="card">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Beneficiary</th>
                  <th>Amount</th>
                  <th>Type</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {transfers.slice(0, 5).map((t) => (
                  <tr key={t.id}>
                    <td>{formatDate(t.createdAt || t.date)}</td>
                    <td>{t.beneficiaryName || t.toAccountNumber}</td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(t.amount, t.currency)}</td>
                    <td><span className="badge badge-info">{t.type}</span></td>
                    <td>
                      <span className={`badge badge-${t.status === 'COMPLETED' ? 'success' : t.status === 'FAILED' ? 'danger' : 'warning'}`}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="card">
            <div className="empty-state">
              <div className="empty-icon"><FiSend /></div>
              <h3>No recent transfers</h3>
              <p>Your transfer activity will appear here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
