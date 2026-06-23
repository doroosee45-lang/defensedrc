import api from '@/lib/apiClient';
import type { AuthUser } from '@/context/AuthContext';

const administrationService = {
  getAllUsers: (params?: Record<string, unknown>) =>
    api.get<AuthUser[]>('/administration/users', { params: params as Record<string, string | number | boolean | undefined | null> }),

  createUser: (data: Partial<AuthUser> & { password: string }) =>
    api.post<AuthUser>('/administration/users', data),

  updateUser: (id: string, data: Partial<AuthUser>) =>
    api.put<AuthUser>(`/administration/users/${id}`, data),

  toggleUser: (id: string) =>
    api.patch<{ actif: boolean }>(`/administration/users/${id}/toggle`),

  resetPassword: (id: string, newPassword: string) =>
    api.patch(`/administration/users/${id}/reset-password`, { newPassword }),
};

export default administrationService;
