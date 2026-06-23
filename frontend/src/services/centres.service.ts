import api from '@/lib/apiClient';

export interface CentreFormation {
  _id: string;
  code: string;
  nom: string;
  zone?: { _id: string; nom: string; code: string } | string;
  region?: { _id: string; nom: string; code: string } | string;
  province: string;
  ville?: string;
  secteur?: string;
  localisation?: { adresse?: string; coordonnees?: { lat: number; lng: number } };
  capaciteAccueil: number;
  statut: 'actif' | 'inactif' | 'renovation' | 'ferme';
  force?: string;
  categoriesFormation?: string[];
  modulesEntrainement?: string[];
  infrastructures?: {
    sallesDeClasse?: number;
    terrainsTir?: number;
    parcoursCombat?: number;
    simulateurs?: number;
    dormitoires?: number;
    capaciteHebergement?: number;
    infirmerie?: boolean;
    bibliotheque?: boolean;
    centre_informatique?: boolean;
    piscine?: boolean;
  };
  statistiques?: {
    stagiairesCourants?: number;
    instructeursActifs?: number;
    formationsEnCours?: number;
    diplomesCetteAnnee?: number;
  };
  contact?: { telephone?: string; email?: string };
  dateCreation?: string;
  createdAt?: string;
}

const centresService = {
  getAll: (params?: Record<string, unknown>) =>
    api.get<CentreFormation[]>('/centres-formation', { params: params as Record<string, string | number | boolean | undefined | null> }),

  getOne: (id: string) =>
    api.get<CentreFormation>(`/centres-formation/${id}`),

  create: (data: Partial<CentreFormation>) =>
    api.post<CentreFormation>('/centres-formation', data),

  update: (id: string, data: Partial<CentreFormation>) =>
    api.put<CentreFormation>(`/centres-formation/${id}`, data),

  delete: (id: string) =>
    api.delete(`/centres-formation/${id}`),
};

export default centresService;
