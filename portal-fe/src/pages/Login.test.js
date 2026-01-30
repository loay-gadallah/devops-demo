import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';

const mockLogin = jest.fn();

jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    isAuthenticated: false,
    loading: false,
  }),
}));

jest.mock('../services/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } },
  },
}));

import Login from './Login';

const renderLogin = () =>
  render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  );

test('renders login form', () => {
  renderLogin();
  expect(screen.getByLabelText('Username')).toBeInTheDocument();
  expect(screen.getByLabelText('Password')).toBeInTheDocument();
  expect(screen.getByText('Sign In')).toBeInTheDocument();
});

test('renders branding', () => {
  renderLogin();
  expect(screen.getByText('RetailBank')).toBeInTheDocument();
  expect(screen.getByText('Welcome back')).toBeInTheDocument();
});

test('shows error on failed login', async () => {
  mockLogin.mockRejectedValueOnce({
    response: { data: { message: 'Bad credentials' } },
  });

  renderLogin();
  fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'user' } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrong' } });
  fireEvent.click(screen.getByText('Sign In'));

  await waitFor(() => {
    expect(screen.getByText('Bad credentials')).toBeInTheDocument();
  });
});
