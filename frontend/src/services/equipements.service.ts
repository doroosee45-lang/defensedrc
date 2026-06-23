import api from '@/lib/apiClient';

export interface Equipement {
  _id: string;
  code: string;
  designation: string;
  type: string;
  categorie?: string;
  marque?: string;
  modele?: string;
  calibre?: string;
  statut: string;
  etat: string;
  quantite: number;
  quantiteDisponible: number;
  seuilAlerte?: number;
  unite?: { _id: string; nom: string; code: string } | string;
  assigneA?: { _id: string; nom: string; prenom: string; matricule: string } | string;
  dateAcquisition?: string;
  valeurUSD?: number;
  classification?: string;
  createdAt?: string;
}

const equipementsService = {
  getAll: (params?: Record<string, unknown>) =>
    api.get<Equipement[]>('/equipements', { params: params as Record<string, string | number | boolean | undefined | null> }),

  getOne: (id: string) =>
    api.get<Equipement>(`/equipements/${id}`),

  create: (data: Partial<Equipement>) =>
    api.post<Equipement>('/equipements', data),

  update: (id: string, data: Partial<Equipement>) =>
    api.put<Equipement>(`/equipements/${id}`, data),

  delete: (id: string) =>
    api.delete(`/equipements/${id}`),
};

export default equipementsService;
