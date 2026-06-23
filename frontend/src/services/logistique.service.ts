import api from '@/lib/apiClient';

export interface TransfertLogistique {
  _id: string;
  numeroTransfert: string;
  type: string;
  statut: string;
  priorite: string;
  uniteExpeditrice: { _id: string; nom: string; code: string } | string;
  uniteDestinataire: { _id: string; nom: string; code: string } | string;
  articles: { designation: string; quantite: number; unite?: string }[];
  responsableExpediteur?: { _id: string; nom: string; prenom: string } | string;
  dateDepart?: string;
  dateLivraisonPrevue?: string;
  dateLivraisonEffective?: string;
  positionActuelle?: { lat: number; lng: number; derniereMAJ?: string };
  alerteDeviation?: { active: boolean; description?: string };
  createdAt?: string;
}

const logistiqueService = {
  getAll: (params?: Record<string, unknown>) =>
    api.get<TransfertLogistique[]>('/logistique', { params: params as Record<string, string | number | boolean | undefined | null> }),

  getOne: (id: string) =>
    api.get<TransfertLogistique>(`/logistique/${id}`),

  create: (data: Partial<TransfertLogistique>) =>
    api.post<TransfertLogistique>('/logistique', data),

  update: (id: string, data: Partial<TransfertLogistique>) =>
    api.put<TransfertLogistique>(`/logistique/${id}`, data),

  delete: (id: string) =>
    api.delete(`/logistique/${id}`),
};

export default logistiqueService;
