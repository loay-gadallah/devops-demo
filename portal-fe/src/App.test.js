import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

test('renders navigation links', () => {
  render(<App />);
  expect(screen.getByText('Dashboard')).toBeInTheDocument();
  expect(screen.getByText('Account')).toBeInTheDocument();
  expect(screen.getByText('Transfer')).toBeInTheDocument();
});

test('renders application title', () => {
  render(<App />);
  expect(screen.getByText('Enterprise Banking Portal')).toBeInTheDocument();
});

test('renders dashboard page by default', () => {
  render(<App />);
  expect(screen.getByText('Welcome back, Demo User')).toBeInTheDocument();
});
