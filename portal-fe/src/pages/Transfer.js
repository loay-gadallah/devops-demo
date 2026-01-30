import React, { useState } from 'react';

function Transfer() {
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!fromAccount || !toAccount || !amount) {
      setError('All fields are required.');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Please enter a valid amount greater than zero.');
      return;
    }

    if (fromAccount === toAccount) {
      setError('Source and destination accounts must be different.');
      return;
    }

    setMessage(`Successfully transferred $${numericAmount.toFixed(2)} from ${fromAccount} to ${toAccount}.`);
    setFromAccount('');
    setToAccount('');
    setAmount('');
  };

  return (
    <div className="transfer">
      <h2>Fund Transfer</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="fromAccount">From Account</label>
          <select
            id="fromAccount"
            value={fromAccount}
            onChange={(e) => setFromAccount(e.target.value)}
          >
            <option value="">Select account</option>
            <option value="Checking ****4521">Checking ****4521</option>
            <option value="Savings ****8834">Savings ****8834</option>
            <option value="Business ****2209">Business ****2209</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="toAccount">To Account</label>
          <select
            id="toAccount"
            value={toAccount}
            onChange={(e) => setToAccount(e.target.value)}
          >
            <option value="">Select account</option>
            <option value="Checking ****4521">Checking ****4521</option>
            <option value="Savings ****8834">Savings ****8834</option>
            <option value="Business ****2209">Business ****2209</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="amount">Amount ($)</label>
          <input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <button type="submit">Submit Transfer</button>
      </form>
      {error && <p className="error" role="alert">{error}</p>}
      {message && <p className="success" role="status">{message}</p>}
    </div>
  );
}

export default Transfer;
