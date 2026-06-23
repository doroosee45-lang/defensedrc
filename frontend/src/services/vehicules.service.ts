import api from '@/lib/apiClient';

export interface Vehicule {
  _id: string;
  immatriculation: string;
  designation: string;
  type: string;
  marque?: string;
  modele?: string;
  annee?: number;
  statut: string;
  unite?: { _id: string; nom: string; code: string } | string;
  chauffeurAssigne?: { _id: string; nom: string; prenom: string; matricule: string } | string;
  caracteristiques?: { capacitePersonnes?: number; blindage?: string; porteeKm?: number };
  kilometrage?: number;
  niveauCarburant?: number;
  prochaineMaintenance?: string;
  positionGPS?: { lat: number; lng: number; vitesse?: number; derniereMAJ?: string };
  valeurUSD?: number;
  createdAt?: string;
}

const vehiculesService = {
  getAll: (params?: Record<string, unknown>) =>
    api.get<Vehicule[]>('/vehicules', { params: params as Record<string, string | number | boolean | undefined | null> }),

  getOne: (id: string) =>
    api.get<Vehicule>(`/vehicules/${id}`),

  create: (data: Partial<Vehicule>) =>
    api.post<Vehicule>('/vehicules', data),

  update: (id: string, data: Partial<Vehicule>) =>
    api.put<Vehicule>(`/vehicules/${id}`, data),

  delete: (id: string) =>
    api.delete(`/vehicules/${id}`),
};

export default vehiculesService;
