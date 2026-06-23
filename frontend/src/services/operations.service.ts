import api from '@/lib/apiClient';

export interface Mission {
  _id: string;
  code: string;
  nom: string;
  type: string;
  statut: string;
  priorite: string;
  classification: string;
  commandant: { _id: string; nom: string; prenom: string; matricule: string } | string;
  unitesPrincipales?: { _id: string; nom: string; code: string }[];
  personnelAssigne?: string[];
  dateDebut: string;
  dateFin?: string;
  dateFinPrevue?: string;
  dureeJours?: number;
  zoneOperation?: { nom?: string; province?: string; territoire?: string };
  objectifs?: string[];
  description?: string;
  resultats?: { blesses: number; morts: number; objectifsAtteints: number; objectifsTotaux: number };
  createdAt?: string;
}

const operationsService = {
  getAll: (params?: Record<string, unknown>) =>
    api.get<Mission[]>('/operations', { params: params as Record<string, string | number | boolean | undefined | null> }),

  getOne: (id: string) =>
    api.get<Mission>(`/operations/${id}`),

  create: (data: Partial<Mission>) =>
    api.post<Mission>('/operations', data),

  update: (id: string, data: Partial<Mission>) =>
    api.put<Mission>(`/operations/${id}`, data),

  delete: (id: string) =>
    api.delete(`/operations/${id}`),

  updateStatut: (id: string, statut: string, notes?: string) =>
    api.patch<Mission>(`/operations/${id}/statut`, { statut, notes }),

  assignPersonnel: (id: string, personnelIds: string[]) =>
    api.post<Mission>(`/operations/${id}/assigner`, { personnelIds }),

  getStats: () =>
    api.get<{ parStatut: { _id: string; count: number }[]; parType: { _id: string; count: number }[] }>('/operations/stats'),
};

export default operationsService;
