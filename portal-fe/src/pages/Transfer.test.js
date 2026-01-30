// Old Transfer.test.js replaced - tests moved to match new Transfers component
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

import Transfers from './Transfer';

beforeEach(() => {
  mockApi.get.mockResolvedValue({ data: [] });
});

test('renders transfer history heading', async () => {
  render(<BrowserRouter><Transfers /></BrowserRouter>);
  await waitFor(() => {
    expect(screen.getByText('Transfer History')).toBeInTheDocument();
  });
});

test('renders new transfer button', async () => {
  render(<BrowserRouter><Transfers /></BrowserRouter>);
  await waitFor(() => {
    expect(screen.getByText('New Transfer')).toBeInTheDocument();
  });
});

test('shows empty state when no transfers', async () => {
  render(<BrowserRouter><Transfers /></BrowserRouter>);
  await waitFor(() => {
    expect(screen.getByText('No transfers yet')).toBeInTheDocument();
  });
});
