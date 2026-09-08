import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from './LoginPage';
import * as authApi from '@/api/auth';

const renderLoginPage = () =>
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  );

describe('LoginPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('shows a validation error and does not call the API when fields are whitespace-only', async () => {
    // Note: the `required` attribute already blocks native submission for genuinely
    // empty fields, so the client-side trim() check only ever fires for whitespace input.
    const loginSpy = vi.spyOn(authApi, 'login');
    renderLoginPage();

    await userEvent.type(screen.getByLabelText(/username/i), '   ');
    await userEvent.type(screen.getByLabelText(/password/i), '   ');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/username and password are required/i)).toBeInTheDocument();
    expect(loginSpy).not.toHaveBeenCalled();
  });

  it('submits credentials and shows the server error on failed login', async () => {
    vi.spyOn(authApi, 'login').mockRejectedValue(new Error('Invalid username or password'));
    renderLoginPage();

    await userEvent.type(screen.getByLabelText(/username/i), 'john');
    await userEvent.type(screen.getByLabelText(/password/i), 'wrongpass');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/invalid username or password/i)).toBeInTheDocument();
  });

  it('calls the login API with the entered credentials', async () => {
    const loginSpy = vi.spyOn(authApi, 'login').mockResolvedValue({ role: 'CUSTOMER', username: 'john' });
    renderLoginPage();

    await userEvent.type(screen.getByLabelText(/username/i), 'john');
    await userEvent.type(screen.getByLabelText(/password/i), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => expect(loginSpy).toHaveBeenCalledWith('john', 'secret123'));
  });
});
