import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from './Dashboard';

test('renders welcome message', () => {
  render(<Dashboard />);
  expect(screen.getByText('Welcome back, Demo User')).toBeInTheDocument();
});

test('renders account summary text', () => {
  render(<Dashboard />);
  expect(screen.getByText('Here is your account summary.')).toBeInTheDocument();
});

test('renders three account cards', () => {
  render(<Dashboard />);
  const cards = screen.getAllByTestId('account-card');
  expect(cards).toHaveLength(3);
});

test('displays account names', () => {
  render(<Dashboard />);
  expect(screen.getByText('Checking Account')).toBeInTheDocument();
  expect(screen.getByText('Savings Account')).toBeInTheDocument();
  expect(screen.getByText('Business Account')).toBeInTheDocument();
});
