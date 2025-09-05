const BASE_URL = import.meta.env.VITE_API_TARGET + import.meta.env.VITE_API_BASE_URL;
const TRAINING_BASEURL = import.meta.env.VITE_API_TARGET + import.meta.env.VITE_TRAINING_BASE_URL;

export interface AuthResponse {
  status: string;
  message?: string;
  token?: string;
  name?: string;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return res.json();
}

export async function setPassword(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/set-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function resetPassword(email: string): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return res.json();
}

export async function completeResetPassword(
  token: string,
  password: string,
  email: string
): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/complete-reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token,
      newPassword: password,
      email
    }),
  });
  return res.json();
}

export async function changePassword(
  oldPassword: string,
  newPassword: string,
  token: string
): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ oldPassword, newPassword }),
  });
  return res.json();
}
