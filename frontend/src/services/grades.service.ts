import api from '@/lib/apiClient';

export interface Grade {
  _id: string;
  code: string;
  nom: string;
  abreviation: string;
  categorie: 'officier_general' | 'officier_superieur' | 'officier_subalterne' | 'sous_officier' | 'soldat';
  niveauHierarchique: number;
  force: string;
  salaireBase: number;
  indemniteCommandement?: number;
  couleurInsigne?: string;
  actif: boolean;
}

const gradesService = {
  getAll: (params?: Record<string, unknown>) =>
    api.get<Grade[]>('/grades', { params: params as Record<string, string | number | boolean | undefined | null> }),

  getOne: (id: string) =>
    api.get<Grade>(`/grades/${id}`),

  create: (data: Partial<Grade>) =>
    api.post<Grade>('/grades', data),

  update: (id: string, data: Partial<Grade>) =>
    api.put<Grade>(`/grades/${id}`, data),

  delete: (id: string) =>
    api.delete(`/grades/${id}`),
};

export default gradesService;
