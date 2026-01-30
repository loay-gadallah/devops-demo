import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';

jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { firstName: 'John', lastName: 'Doe', role: 'Customer' },
    isAuthenticated: true,
    loading: false,
  }),
}));

const mockApi = {
  get: jest.fn(),
  post: jest.fn(),
  interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } },
};

jest.mock('../services/api', () => ({
  __esModule: true,
  default: mockApi,
}));

import Dashboard from './Dashboard';

const renderDashboard = () =>
  render(
    <BrowserRouter>
      <Dashboard />
    </BrowserRouter>
  );

beforeEach(() => {
  mockApi.get.mockImplementation((url) => {
    if (url.includes('stats')) {
      return Promise.resolve({
        data: { totalBalance: 50000, accountCount: 3, activeCards: 2, pendingTransfers: 1 },
      });
    }
    if (url.includes('transfers')) {
      return Promise.resolve({ data: [] });
    }
    return Promise.resolve({ data: {} });
  });
});

test('renders stat cards after loading', async () => {
  renderDashboard();
  await waitFor(() => {
    expect(screen.getByText('Total Balance')).toBeInTheDocument();
    expect(screen.getByText('Accounts')).toBeInTheDocument();
    expect(screen.getByText('Active Cards')).toBeInTheDocument();
    expect(screen.getByText('Pending Transfers')).toBeInTheDocument();
  });
});

test('displays formatted total balance', async () => {
  renderDashboard();
  await waitFor(() => {
    expect(screen.getByText('$50,000.00')).toBeInTheDocument();
  });
});

test('shows empty state when no transfers', async () => {
  renderDashboard();
  await waitFor(() => {
    expect(screen.getByText('No recent transfers')).toBeInTheDocument();
  });
});
