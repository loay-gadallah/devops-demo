import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import api from '../services/api';
import './AccountDetail.css';

const formatCurrency = (amount, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);

const formatDate = (dateStr) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(dateStr));

export default function AccountDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [accRes, txRes] = await Promise.all([
          api.get(`/api/accounts/${id}`),
          api.get(`/api/accounts/${id}/transactions`),
        ]);
        setAccount(accRes.data);
        setTransactions(txRes.data.content || txRes.data || []);
      } catch (err) {
        console.error('Failed to load account details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return <div className="spinner-container"><div className="spinner" /></div>;
  }

  if (!account) {
    return (
      <div className="card">
        <div className="empty-state">
          <h3>Account not found</h3>
          <p>The requested account could not be loaded.</p>
          <button className="btn btn-primary" onClick={() => navigate('/accounts')}>
            Back to Accounts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="account-detail">
      <button className="btn btn-secondary btn-sm back-btn" onClick={() => navigate('/accounts')}>
        <FiArrowLeft /> Back to Accounts
      </button>

      <div className="card account-summary">
        <div className="summary-row">
          <div>
            <h2>{account.accountName || account.name}</h2>
            <p className="account-detail-number">{account.accountNumber}</p>
          </div>
          <div className="summary-right">
            <div className="summary-balance">{formatCurrency(account.balance, account.currency)}</div>
            <span className={`badge badge-${account.status === 'ACTIVE' ? 'success' : 'danger'}`}>
              {account.status}
            </span>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 16 }}>Transactions</h3>
        {transactions.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Balance After</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td>{formatDate(tx.date || tx.createdAt)}</td>
                  <td>{tx.description}</td>
                  <td>
                    <span className={`badge badge-${tx.type === 'CREDIT' ? 'success' : 'danger'}`}>
                      {tx.type}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, color: tx.type === 'CREDIT' ? '#059669' : '#dc2626' }}>
                    {tx.type === 'CREDIT' ? '+' : '-'}{formatCurrency(Math.abs(tx.amount), account.currency)}
                  </td>
                  <td>{formatCurrency(tx.balanceAfter, account.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <h3>No transactions</h3>
            <p>No transaction history available for this account.</p>
          </div>
        )}
      </div>
    </div>
  );
}
