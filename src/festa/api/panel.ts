import { apiRequest } from './http';

export type PanelUser = {
  id: string;
  full_name: string;
  username: string;
  created_at: string;
  avatar_url: string | null;
  panel_access: boolean;
  is_blocked: boolean;
  is_approved: boolean;
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
      pending: number;
      recentActivity: ActivityItem[];
    }>('/api/panel/dashboard'),

  users: (params: {
    search?: string;
    page?: number;
    pageSize?: number;
    approved?: boolean;
  } = {}) => {
    const q = new URLSearchParams();
    if (params.search) q.set('search', params.search);
    if (params.approved === true) q.set('approved', '1');
    if (params.approved === false) q.set('approved', '0');
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

  setApproved: (id: string, approved: boolean) =>
    apiRequest<{ user: PanelUser }>(`/api/panel/users/${id}/approve`, {
      method: 'PATCH',
      data: { approved },
    }),

  wipeContent: (id: string) =>
    apiRequest<{ ok: boolean; photos: number; videos: number; comments: number; reactions: number }>(
      `/api/panel/users/${id}/wipe-content`,
      { method: 'POST' },
    ),

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

  settings: () =>
    apiRequest<{ settings: { autoApproveUsers: boolean } }>('/api/panel/settings'),

  updateSettings: (data: { autoApproveUsers: boolean }) =>
    apiRequest<{ settings: { autoApproveUsers: boolean } }>('/api/panel/settings', {
      method: 'PATCH',
      data,
    }),
};
