import api from '@/lib/apiClient';

export interface Presence {
  _id: string;
  militaire: { _id: string; nom: string; prenom: string; matricule: string; grade?: string } | string;
  unite: { _id: string; nom: string; code: string } | string;
  date: string;
  heureArrivee?: string;
  heureDepart?: string;
  statut: string;
  methode?: string;
  motifAbsence?: string;
  valide: boolean;
  valideePar?: { _id: string; nom: string; prenom: string } | string;
  createdAt?: string;
}

const presencesService = {
  getAll: (params?: Record<string, unknown>) =>
    api.get<Presence[]>('/presences', { params: params as Record<string, string | number | boolean | undefined | null> }),

  getOne: (id: string) =>
    api.get<Presence>(`/presences/${id}`),

  getByMilitaire: (militaireId: string) =>
    api.get<Presence[]>(`/presences/militaire/${militaireId}`),

  create: (data: Partial<Presence>) =>
    api.post<Presence>('/presences', data),

  update: (id: string, data: Partial<Presence>) =>
    api.put<Presence>(`/presences/${id}`, data),

  valider: (id: string) =>
    api.patch<Presence>(`/presences/${id}/valider`),

  delete: (id: string) =>
    api.delete(`/presences/${id}`),

  getStats: (params?: { unite?: string; dateDebut?: string; dateFin?: string }) =>
    api.get<{ _id: string; count: number }[]>('/presences/stats', { params }),
};

export default presencesService;
