import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiAlertCircle } from 'react-icons/fi';
import api from '../services/api';
import './NewTransfer.css';

const TABS = [
  { key: 'INTERNAL', label: 'Between My Accounts' },
  { key: 'LOCAL', label: 'Local Transfer' },
  { key: 'INTERNATIONAL', label: 'International Transfer' },
];

export default function NewTransfer() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('INTERNAL');
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    fromAccountId: '',
    toAccountId: '',
    toAccountNumber: '',
    beneficiaryName: '',
    amount: '',
    currency: 'USD',
    description: '',
  });

  useEffect(() => {
    api.get('/api/accounts')
      .then((res) => setAccounts(res.data))
      .catch(() => {});
  }, []);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const payload = {
        type: activeTab,
        fromAccountId: form.fromAccountId,
        amount: parseFloat(form.amount),
        currency: activeTab === 'INTERNATIONAL' ? form.currency : 'USD',
        description: form.description,
      };

      if (activeTab === 'INTERNAL') {
        payload.toAccountId = form.toAccountId;
      } else {
        payload.toAccountNumber = form.toAccountNumber;
        payload.beneficiaryName = form.beneficiaryName;
      }

      await api.post('/api/transfers', payload);
      setSuccess('Transfer submitted successfully!');
      setForm({
        fromAccountId: '',
        toAccountId: '',
        toAccountNumber: '',
        beneficiaryName: '',
        amount: '',
        currency: 'USD',
        description: '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Transfer failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="new-transfer-page">
      <button className="btn btn-secondary btn-sm" onClick={() => navigate('/transfers')} style={{ marginBottom: 20 }}>
        <FiArrowLeft /> Back to Transfers
      </button>

      <div className="card">
        <div className="tabs">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => { setActiveTab(tab.key); setError(''); setSuccess(''); }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {success && (
          <div className="transfer-success">
            <FiCheck /> {success}
          </div>
        )}
        {error && (
          <div className="transfer-error">
            <FiAlertCircle /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">From Account</label>
            <select className="form-select" value={form.fromAccountId} onChange={handleChange('fromAccountId')} required>
              <option value="">Select account</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.accountName || a.name} ({a.accountNumber})
                </option>
              ))}
            </select>
          </div>

          {activeTab === 'INTERNAL' ? (
            <div className="form-group">
              <label className="form-label">To Account</label>
              <select className="form-select" value={form.toAccountId} onChange={handleChange('toAccountId')} required>
                <option value="">Select account</option>
                {accounts
                  .filter((a) => a.id !== form.fromAccountId)
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.accountName || a.name} ({a.accountNumber})
                    </option>
                  ))}
              </select>
            </div>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label">
                  {activeTab === 'INTERNATIONAL' ? 'IBAN / Account Number' : 'To Account Number'}
                </label>
                <input
                  className="form-input"
                  type="text"
                  placeholder={activeTab === 'INTERNATIONAL' ? 'Enter IBAN' : 'Enter account number'}
                  value={form.toAccountNumber}
                  onChange={handleChange('toAccountNumber')}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Beneficiary Name</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Enter beneficiary name"
                  value={form.beneficiaryName}
                  onChange={handleChange('beneficiaryName')}
                  required
                />
              </div>
            </>
          )}

          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Amount</label>
              <input
                className="form-input"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={handleChange('amount')}
                required
              />
            </div>
            {activeTab === 'INTERNATIONAL' && (
              <div className="form-group" style={{ width: 140 }}>
                <label className="form-label">Currency</label>
                <select className="form-select" value={form.currency} onChange={handleChange('currency')}>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                  <option value="AED">AED</option>
                </select>
              </div>
            )}
          </div>

          {activeTab !== 'INTERNAL' && (
            <div className="form-group">
              <label className="form-label">Description (optional)</label>
              <input
                className="form-input"
                type="text"
                placeholder="Payment description"
                value={form.description}
                onChange={handleChange('description')}
              />
            </div>
          )}

          <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ width: '100%', marginTop: 8 }}>
            {loading ? <span className="spinner spinner-sm" /> : 'Submit Transfer'}
          </button>
        </form>
      </div>
    </div>
  );
}
