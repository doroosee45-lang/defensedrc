import api, { ApiResponse } from '@/lib/apiClient';

export interface Militaire {
  _id: string;
  matricule: string;
  nom: string;
  prenom: string;
  nomComplet?: string;
  dateNaissance: string;
  age?: number;
  sexe: 'M' | 'F';
  nationalite?: string;
  situationFamiliale?: string;
  nombreEnfants?: number;
  photo?: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  province?: string;
  ville?: string;
  grade: { _id: string; nom: string; abreviation: string; categorie: string; niveauHierarchique?: number } | string;
  gradeNom?: string;
  unite: { _id: string; nom: string; code: string; type: string } | string;
  uniteNom?: string;
  fonction?: string;
  specialite?: string;
  force: 'terrestre' | 'aerienne' | 'maritime' | 'emg';
  statut: string;
  dateEngagement?: string;
  datePromotion?: string;
  anneesService?: number;
  groupeSanguin?: string;
  biometrie?: { empreintesEnregistrees: boolean; photoFaceEnregistree: boolean };
  positionGPS?: { lat: number; lng: number; derniereMAJ: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface PersonnelFilters {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  statut?: string;
  force?: string;
  unite?: string;
  grade?: string;
  sexe?: string;
}

export interface PersonnelStats {
  total: number;
  parStatut: { _id: string; count: number }[];
  parForce: { _id: string; count: number }[];
  parSexe: { _id: string; count: number }[];
}

const personnelService = {
  getAll: (filters?: PersonnelFilters) =>
    api.get<Militaire[]>('/personnel', { params: filters as Record<string, string | number | boolean | undefined | null> }),

  getOne: (id: string) =>
    api.get<Militaire>(`/personnel/${id}`),

  create: (data: Partial<Militaire>) =>
    api.post<Militaire>('/personnel', data),

  update: (id: string, data: Partial<Militaire>) =>
    api.put<Militaire>(`/personnel/${id}`, data),

  delete: (id: string) =>
    api.delete(`/personnel/${id}`),

  uploadPhoto: (id: string, file: File) => {
    const form = new FormData();
    form.append('photo', file);
    return api.upload<{ photo: string }>(`/personnel/${id}/photo`, form);
  },

  getStats: () =>
    api.get<PersonnelStats>('/personnel/stats'),
};

export default personnelService;
