// Old Account.test.js replaced - tests moved to match new Accounts component
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';

const mockApi = {
  get: jest.fn(),
  post: jest.fn(),
  interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } },
};

jest.mock('../services/api', () => ({
  __esModule: true,
  default: mockApi,
}));

jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { firstName: 'John', lastName: 'Doe' },
    isAuthenticated: true,
    loading: false,
  }),
}));

import Accounts from './Account';

beforeEach(() => {
  mockApi.get.mockResolvedValue({
    data: [
      { id: '1', accountName: 'Checking Account', accountNumber: '00124521', type: 'CHECKING', balance: 12450.75, currency: 'USD' },
      { id: '2', accountName: 'Savings Account', accountNumber: '00128834', type: 'SAVINGS', balance: 48200.00, currency: 'USD' },
    ],
  });
});

test('renders account cards after loading', async () => {
  render(<BrowserRouter><Accounts /></BrowserRouter>);
  await waitFor(() => {
    expect(screen.getByText('Checking Account')).toBeInTheDocument();
    expect(screen.getByText('Savings Account')).toBeInTheDocument();
  });
});

test('displays formatted balance', async () => {
  render(<BrowserRouter><Accounts /></BrowserRouter>);
  await waitFor(() => {
    expect(screen.getByText('$12,450.75')).toBeInTheDocument();
  });
});
