import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Account from './Account';

test('renders account details heading', () => {
  render(<Account />);
  expect(screen.getByText('Account Details')).toBeInTheDocument();
});

test('displays account number', () => {
  render(<Account />);
  expect(screen.getByText('0012-4587-4521')).toBeInTheDocument();
});

test('displays account balance', () => {
  render(<Account />);
  expect(screen.getByText('$12,450.75')).toBeInTheDocument();
});

test('renders recent transactions heading', () => {
  render(<Account />);
  expect(screen.getByText('Recent Transactions')).toBeInTheDocument();
});

test('renders five transaction rows', () => {
  render(<Account />);
  const rows = screen.getAllByTestId('transaction-row');
  expect(rows).toHaveLength(5);
});
