import api from '@/lib/apiClient';

export interface BaseMilitaire {
  _id: string;
  code: string;
  nom: string;
  type: string;
  force: string;
  statut: string;
  niveauSecurite: string;
  commandant?: { _id: string; nom: string; prenom: string; matricule: string } | string;
  unite?: { _id: string; nom: string; code: string } | string;
  localisation: { province: string; territoire?: string; adresse?: string; coordonnees: { lat: number; lng: number } };
  capacite?: { personnel?: number; vehicules?: number };
  effectifActuel?: { officiers?: number; sousOfficiers?: number; soldats?: number };
  effectifTotal?: number;
  stocks?: { carburantLitres?: number; vivresJours?: number; munitionsStatut?: string; medicamentsStatut?: string };
  createdAt?: string;
}

const basesService = {
  getAll: (params?: Record<string, unknown>) =>
    api.get<BaseMilitaire[]>('/bases', { params: params as Record<string, string | number | boolean | undefined | null> }),

  getOne: (id: string) =>
    api.get<BaseMilitaire>(`/bases/${id}`),

  create: (data: Partial<BaseMilitaire>) =>
    api.post<BaseMilitaire>('/bases', data),

  update: (id: string, data: Partial<BaseMilitaire>) =>
    api.put<BaseMilitaire>(`/bases/${id}`, data),

  delete: (id: string) =>
    api.delete(`/bases/${id}`),
};

export default basesService;
