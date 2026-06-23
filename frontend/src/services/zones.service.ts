import api from '@/lib/apiClient';

export interface ZoneMilitaire {
  _id: string;
  numero: number;
  code: string;
  nom: string;
  quartierGeneral: string;
  nombreRegions: number;
  nombreProvinces: number;
  nombreBases: number;
  nombreMilitaires: number;
  niveauAlerte: 'normal' | 'vigilance' | 'alerte' | 'urgence';
  statutOperationnel: 'operationnel' | 'alerte' | 'engage' | 'releve';
  localisation: { province?: string; coordonnees?: { lat: number; lng: number } };
  contact?: { telephone?: string; email?: string };
  actif: boolean;
  createdAt?: string;
}

export interface RegionMilitaire {
  _id: string;
  numero: number;
  code: string;
  nom: string;
  zone: { _id: string; nom: string; code: string } | string;
  quartierGeneral?: string;
  provinces: string[];
  statistiques?: {
    militaires?: number;
    unites?: number;
    bases?: number;
    casernes?: number;
    vehicules?: number;
    munitionsStatut?: string;
  };
  niveauAlerte: 'normal' | 'vigilance' | 'alerte' | 'urgence';
  statut: 'active' | 'alerte' | 'engagee' | 'interne';
  localisation?: { province?: string; coordonnees?: { lat: number; lng: number } };
  contact?: { telephone?: string; email?: string };
  actif: boolean;
  createdAt?: string;
}

const zonesService = {
  getAll: (params?: Record<string, unknown>) =>
    api.get<ZoneMilitaire[]>('/zones-militaires', { params: params as Record<string, string | number | boolean | undefined | null> }),

  getOne: (id: string) =>
    api.get<ZoneMilitaire>(`/zones-militaires/${id}`),

  create: (data: Partial<ZoneMilitaire>) =>
    api.post<ZoneMilitaire>('/zones-militaires', data),

  update: (id: string, data: Partial<ZoneMilitaire>) =>
    api.put<ZoneMilitaire>(`/zones-militaires/${id}`, data),

  delete: (id: string) =>
    api.delete(`/zones-militaires/${id}`),
};

export const regionsService = {
  getAll: (params?: Record<string, unknown>) =>
    api.get<RegionMilitaire[]>('/regions-militaires', { params: params as Record<string, string | number | boolean | undefined | null> }),

  getOne: (id: string) =>
    api.get<RegionMilitaire>(`/regions-militaires/${id}`),

  create: (data: Partial<RegionMilitaire>) =>
    api.post<RegionMilitaire>('/regions-militaires', data),

  update: (id: string, data: Partial<RegionMilitaire>) =>
    api.put<RegionMilitaire>(`/regions-militaires/${id}`, data),

  delete: (id: string) =>
    api.delete(`/regions-militaires/${id}`),
};

export default zonesService;
