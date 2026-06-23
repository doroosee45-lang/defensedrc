import api from '@/lib/apiClient';

export interface Unite {
  _id: string;
  code: string;
  nom: string;
  sigle?: string;
  type: string;
  force: string;
  parent?: { _id: string; nom: string; code: string } | string | null;
  commandant?: { _id: string; nom: string; prenom: string; matricule: string } | string;
  localisation?: { province?: string; territoire?: string; coordonnees?: { lat: number; lng: number }; adresse?: string };
  effectifAutorise?: number;
  effectifActuel?: number;
  niveauAlerte?: string;
  statut?: string;
  contact?: { telephone?: string; radio?: string; email?: string };
}

const unitesService = {
  getAll: (params?: Record<string, unknown>) =>
    api.get<Unite[]>('/unites', { params: params as Record<string, string | number | boolean | undefined | null> }),

  getOne: (id: string) =>
    api.get<Unite>(`/unites/${id}`),

  create: (data: Partial<Unite>) =>
    api.post<Unite>('/unites', data),

  update: (id: string, data: Partial<Unite>) =>
    api.put<Unite>(`/unites/${id}`, data),

  delete: (id: string) =>
    api.delete(`/unites/${id}`),
};

export default unitesService;
