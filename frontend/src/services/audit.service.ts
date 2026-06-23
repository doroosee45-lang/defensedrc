import api from '@/lib/apiClient';

export interface AuditLog {
  _id: string;
  utilisateur?: { _id: string; nom: string; prenom: string; matricule: string } | string;
  matricule?: string;
  nomUtilisateur?: string;
  role?: string;
  action: string;
  module: string;
  ressource?: string;
  ressourceId?: string;
  description?: string;
  ip?: string;
  methodeHTTP?: string;
  endpoint?: string;
  statut: string;
  niveauRisque: string;
  dureeMs?: number;
  createdAt: string;
}

const auditService = {
  getAll: (params?: Record<string, unknown>) =>
    api.get<AuditLog[]>('/audit', { params: params as Record<string, string | number | boolean | undefined | null> }),

  getStats: () =>
    api.get('/audit/stats'),

  getByUser: (userId: string, params?: Record<string, unknown>) =>
    api.get<AuditLog[]>(`/audit/user/${userId}`, { params: params as Record<string, string | number | boolean | undefined | null> }),
};

export default auditService;
