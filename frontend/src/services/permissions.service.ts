import api from '@/lib/apiClient';

export interface Permission {
  _id: string;
  militaire: { _id: string; nom: string; prenom: string; matricule: string } | string;
  unite: { _id: string; nom: string; code: string } | string;
  type: string;
  statut: string;
  dateDebut: string;
  dateFin: string;
  nombreJours?: number;
  motif: string;
  adresseConge?: string;
  telephoneUrgence?: string;
  approuvePar?: { _id: string; nom: string; prenom: string } | string;
  dateApprobation?: string;
  commentaireApprobation?: string;
  createdAt?: string;
}

const permissionsService = {
  getAll: (params?: Record<string, unknown>) =>
    api.get<Permission[]>('/permissions', { params: params as Record<string, string | number | boolean | undefined | null> }),

  getOne: (id: string) =>
    api.get<Permission>(`/permissions/${id}`),

  getByMilitaire: (militaireId: string) =>
    api.get<Permission[]>(`/permissions/militaire/${militaireId}`),

  create: (data: Partial<Permission>) =>
    api.post<Permission>('/permissions', data),

  update: (id: string, data: Partial<Permission>) =>
    api.put<Permission>(`/permissions/${id}`, data),

  approuver: (id: string, decision: 'approuvee' | 'refusee', commentaire?: string) =>
    api.patch<Permission>(`/permissions/${id}/approuver`, { decision, commentaire }),

  delete: (id: string) =>
    api.delete(`/permissions/${id}`),
};

export default permissionsService;
