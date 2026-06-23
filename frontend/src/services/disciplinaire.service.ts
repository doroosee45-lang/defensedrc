import api from '@/lib/apiClient';

export interface DossierDisciplinaire {
  _id: string;
  militaire: { _id: string; nom: string; prenom: string; matricule: string } | string;
  type: 'infraction' | 'sanction' | 'distinction' | 'felicitation' | 'avertissement';
  categorie?: string;
  statut: string;
  date: string;
  description: string;
  faitsReproches?: string;
  infraction?: string;
  sanction?: { type: string; dureeJours?: number; dateDebut?: string; dateFin?: string };
  distinction?: { type: string; intitule?: string; motif?: string };
  rapport?: string;
  createdAt?: string;
}

const disciplinaireService = {
  getAll: (params?: Record<string, unknown>) =>
    api.get<DossierDisciplinaire[]>('/disciplinaire', { params: params as Record<string, string | number | boolean | undefined | null> }),

  getOne: (id: string) =>
    api.get<DossierDisciplinaire>(`/disciplinaire/${id}`),

  create: (data: Partial<DossierDisciplinaire>) =>
    api.post<DossierDisciplinaire>('/disciplinaire', data),

  update: (id: string, data: Partial<DossierDisciplinaire>) =>
    api.put<DossierDisciplinaire>(`/disciplinaire/${id}`, data),

  delete: (id: string) =>
    api.delete(`/disciplinaire/${id}`),
};

export default disciplinaireService;
