import api from '@/lib/apiClient';

export interface Alerte {
  _id: string;
  titre: string;
  description: string;
  type: string;
  niveau: 'critique' | 'haute' | 'moyenne' | 'basse' | 'info';
  statut: 'active' | 'lue' | 'traitee' | 'fermee' | 'ignoree';
  source?: string;
  unitesConcernees?: { _id: string; nom: string; code: string }[];
  localisation?: { province?: string; territoire?: string; coordonnees?: { lat: number; lng: number } };
  lectures?: { utilisateur: string; date: string }[];
  traitePar?: { _id: string; nom: string; prenom: string } | string;
  dateTraitement?: string;
  actionsPrises?: string;
  createdAt?: string;
}

export interface AlerteStats {
  parNiveau: { _id: string; count: number }[];
  parType: { _id: string; count: number }[];
  parStatut: { _id: string; count: number }[];
}

const alertesService = {
  getAll: (params?: Record<string, unknown>) =>
    api.get<Alerte[]>('/alertes', { params: params as Record<string, string | number | boolean | undefined | null> }),

  getActives: (params?: { niveau?: string }) =>
    api.get<Alerte[]>('/alertes/actives', { params }),

  getOne: (id: string) =>
    api.get<Alerte>(`/alertes/${id}`),

  create: (data: Partial<Alerte>) =>
    api.post<Alerte>('/alertes', data),

  diffuser: (data: Partial<Alerte>) =>
    api.post<Alerte>('/alertes/diffuser', data),

  update: (id: string, data: Partial<Alerte>) =>
    api.put<Alerte>(`/alertes/${id}`, data),

  marquerLue: (id: string) =>
    api.patch<Alerte>(`/alertes/${id}/lue`),

  traiter: (id: string, actionsPrises: string) =>
    api.patch<Alerte>(`/alertes/${id}/traiter`, { actionsPrises }),

  delete: (id: string) =>
    api.delete(`/alertes/${id}`),

  getStats: () =>
    api.get<AlerteStats>('/alertes/stats'),
};

export default alertesService;
