import { apiRequest } from './http';

export type PanelUser = {
  id: string;
  full_name: string;
  username: string;
  created_at: string;
  avatar_url: string | null;
  panel_access: boolean;
  is_blocked: boolean;
};

export type ActivityItem = {
  id: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  meta: unknown;
  createdAt: string;
  actor: { id: string; full_name: string | null; username: string | null } | null;
};

export const panelApi = {
  register: (data: { fullName: string; password: string; username?: string }) =>
    apiRequest<{ user: PanelUser; token: string; message: string }>('/api/panel/auth/register', {
      method: 'POST',
      data,
    }),

  login: (data: { username: string; password: string }) =>
    apiRequest<{ user: PanelUser; token: string }>('/api/panel/auth/login', {
      method: 'POST',
      data,
    }),

  me: () => apiRequest<{ user: PanelUser }>('/api/panel/me'),

  dashboard: () =>
    apiRequest<{
      users: number;
      blocked: number;
      recentActivity: ActivityItem[];
    }>('/api/panel/dashboard'),

  users: (params: { search?: string; page?: number; pageSize?: number } = {}) => {
    const q = new URLSearchParams();
    if (params.search) q.set('search', params.search);
    q.set('page', String(params.page ?? 1));
    q.set('pageSize', String(params.pageSize ?? 20));
    return apiRequest<{ users: PanelUser[]; total: number; page: number; pageSize: number }>(
      `/api/panel/users?${q.toString()}`,
    );
  },

  user: (id: string) => apiRequest<{ user: PanelUser }>(`/api/panel/users/${id}`),

  setBlocked: (id: string, blocked: boolean) =>
    apiRequest<{ user: PanelUser }>(`/api/panel/users/${id}/block`, {
      method: 'PATCH',
      data: { blocked },
    }),

  resetPassword: (id: string, password: string) =>
    apiRequest<{ ok: boolean }>(`/api/panel/users/${id}/reset-password`, {
      method: 'POST',
      data: { password },
    }),

  activity: (params: { userId?: string; page?: number; pageSize?: number } = {}) => {
    const q = new URLSearchParams();
    if (params.userId) q.set('userId', params.userId);
    q.set('page', String(params.page ?? 1));
    q.set('pageSize', String(params.pageSize ?? 30));
    return apiRequest<{
      items: ActivityItem[];
      total: number;
      page: number;
      pageSize: number;
    }>(`/api/panel/activity?${q.toString()}`);
  },
};
