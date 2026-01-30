import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Transfer from './Transfer';

test('renders transfer form heading', () => {
  render(<Transfer />);
  expect(screen.getByText('Fund Transfer')).toBeInTheDocument();
});

test('renders from account select', () => {
  render(<Transfer />);
  expect(screen.getByLabelText('From Account')).toBeInTheDocument();
});

test('renders to account select', () => {
  render(<Transfer />);
  expect(screen.getByLabelText('To Account')).toBeInTheDocument();
});

test('renders amount input', () => {
  render(<Transfer />);
  expect(screen.getByLabelText('Amount ($)')).toBeInTheDocument();
});

test('renders submit button', () => {
  render(<Transfer />);
  expect(screen.getByText('Submit Transfer')).toBeInTheDocument();
});

test('shows error when submitting empty form', () => {
  render(<Transfer />);
  fireEvent.click(screen.getByText('Submit Transfer'));
  expect(screen.getByRole('alert')).toHaveTextContent('All fields are required.');
});

test('shows error for same source and destination', () => {
  render(<Transfer />);
  fireEvent.change(screen.getByLabelText('From Account'), { target: { value: 'Checking ****4521' } });
  fireEvent.change(screen.getByLabelText('To Account'), { target: { value: 'Checking ****4521' } });
  fireEvent.change(screen.getByLabelText('Amount ($)'), { target: { value: '100' } });
  fireEvent.click(screen.getByText('Submit Transfer'));
  expect(screen.getByRole('alert')).toHaveTextContent('Source and destination accounts must be different.');
});

test('shows success message on valid transfer', () => {
  render(<Transfer />);
  fireEvent.change(screen.getByLabelText('From Account'), { target: { value: 'Checking ****4521' } });
  fireEvent.change(screen.getByLabelText('To Account'), { target: { value: 'Savings ****8834' } });
  fireEvent.change(screen.getByLabelText('Amount ($)'), { target: { value: '250.00' } });
  fireEvent.click(screen.getByText('Submit Transfer'));
  expect(screen.getByRole('status')).toHaveTextContent('Successfully transferred $250.00');
});
