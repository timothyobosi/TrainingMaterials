export interface AuthResponse {
  status: string;
  message?: string;
  token?: string;
  name?: string;
}

export function login(email: string, password: string): Promise<AuthResponse>;
export function setPassword(email: string, password: string): Promise<AuthResponse>;
export function resetPassword(email: string): Promise<AuthResponse>;
export function completeResetPassword(
  token: string,
  password: string,
  email: string
): Promise<AuthResponse>;
