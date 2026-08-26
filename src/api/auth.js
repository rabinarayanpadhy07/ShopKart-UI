import { request } from './client';

export function login(username, password) {
  return request('/api/auth/login', { method: 'POST', body: { username, password } });
}

export function logout() {
  return request('/api/auth/logout', { method: 'POST' });
}

export function register(payload) {
  return request('/api/users/register', { method: 'POST', body: payload });
}

export function googleLogin(credential) {
  return request('/api/auth/google', { method: 'POST', body: { credential } });
}
