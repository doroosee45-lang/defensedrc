import api from '@/lib/apiClient';

export interface Document {
  _id: string;
  numero: string;
  titre: string;
  type: string;
  classification: string;
  statut: string;
  auteur: { _id: string; nom: string; prenom: string; matricule: string } | string;
  unite?: { _id: string; nom: string; code: string } | string;
  contenu?: string;
  fichiers?: { nom: string; type: string; taille: number; url: string; dateUpload?: string }[];
  version?: string;
  dateDocument?: string;
  dateValidite?: string;
  tags?: string[];
  nombreVues?: number;
  createdAt?: string;
}

const documentsService = {
  getAll: (params?: Record<string, unknown>) =>
    api.get<Document[]>('/documents', { params: params as Record<string, string | number | boolean | undefined | null> }),

  getOne: (id: string) =>
    api.get<Document>(`/documents/${id}`),

  create: (data: Partial<Document>) =>
    api.post<Document>('/documents', data),

  update: (id: string, data: Partial<Document>) =>
    api.put<Document>(`/documents/${id}`, data),

  uploadFichier: (id: string, file: File) => {
    const form = new FormData();
    form.append('fichier', file);
    return api.upload<Document>(`/documents/${id}/upload`, form);
  },

  delete: (id: string) =>
    api.delete(`/documents/${id}`),
};

export default documentsService;
