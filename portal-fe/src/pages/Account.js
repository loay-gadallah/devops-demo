import React from 'react';

function Account() {
  const account = {
    name: 'Checking Account',
    number: '0012-4587-4521',
    balance: 12450.75,
    type: 'Personal Checking',
    status: 'Active',
  };

  const transactions = [
    { id: 1, date: '2024-01-15', description: 'Direct Deposit - Payroll', amount: 3500.00 },
    { id: 2, date: '2024-01-14', description: 'Grocery Store', amount: -87.32 },
    { id: 3, date: '2024-01-13', description: 'Electric Bill', amount: -142.50 },
    { id: 4, date: '2024-01-12', description: 'Transfer from Savings', amount: 500.00 },
    { id: 5, date: '2024-01-10', description: 'Online Purchase', amount: -65.99 },
  ];

  return (
    <div className="account-details">
      <h2>Account Details</h2>
      <div className="account-info">
        <p><strong>Account Name:</strong> {account.name}</p>
        <p><strong>Account Number:</strong> {account.number}</p>
        <p><strong>Account Type:</strong> {account.type}</p>
        <p><strong>Status:</strong> {account.status}</p>
        <p><strong>Balance:</strong> ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
      </div>
      <h3>Recent Transactions</h3>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id} data-testid="transaction-row">
              <td>{tx.date}</td>
              <td>{tx.description}</td>
              <td className={tx.amount >= 0 ? 'credit' : 'debit'}>
                ${Math.abs(tx.amount).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Account;
