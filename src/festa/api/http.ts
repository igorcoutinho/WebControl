export const API_URL =
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:4000';

const TOKEN_KEY = 'webcontrol_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}

export async function apiRequest<T>(
  path: string,
  options: { method?: string; data?: unknown } = {},
): Promise<T> {
  const { method = 'GET', data } = options;
  const token = getToken();

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: data === undefined ? undefined : JSON.stringify(data),
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      (body as { error?: string } | null)?.error || `Erro (${response.status})`,
      response.status,
    );
  }

  return body as T;
}
