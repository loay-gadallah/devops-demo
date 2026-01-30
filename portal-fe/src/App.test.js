import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('./context/AuthContext', () => ({
  AuthProvider: ({ children }) => <div>{children}</div>,
  useAuth: () => ({ isAuthenticated: false, loading: false, user: null, login: jest.fn(), logout: jest.fn() }),
}));

jest.mock('./services/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(() => Promise.resolve({ data: [] })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } },
  },
}));

import App from './App';

test('renders without crashing', () => {
  const { container } = render(<App />);
  expect(container).toBeInTheDocument();
});
