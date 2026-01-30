import React from 'react';

function Dashboard() {
  const accounts = [
    { name: 'Checking Account', balance: 12450.75, number: '****4521' },
    { name: 'Savings Account', balance: 48200.00, number: '****8834' },
    { name: 'Business Account', balance: 135780.50, number: '****2209' },
  ];

  return (
    <div className="dashboard">
      <h2>Welcome back, Demo User</h2>
      <p>Here is your account summary.</p>
      <div className="account-cards">
        {accounts.map((account) => (
          <div key={account.number} className="card" data-testid="account-card">
            <h3>{account.name}</h3>
            <p className="account-number">{account.number}</p>
            <p className="balance">${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
