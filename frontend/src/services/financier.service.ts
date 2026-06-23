import api from '@/lib/apiClient';

export interface FicheFinanciere {
  _id: string;
  militaire: { _id: string; nom: string; prenom: string; matricule: string; grade?: string } | string;
  periode: { mois: number; annee: number };
  salaire: {
    base?: number; indemniteGrade?: number; indemniteCommandement?: number;
    indemniteMission?: number; indemnitePrime?: number; indemniteRisque?: number;
    indemniteFamille?: number; indemniteFront?: number; heuresSupp?: number;
  };
  deductions: {
    impotRevenu?: number; cnss?: number; mutuelle?: number;
    pret?: number; avance?: number; saisie?: number; autre?: number;
  };
  totalBrut: number;
  totalDeductions: number;
  totalNet: number;
  devise: 'CDF' | 'USD';
  statut: string;
  paiement?: { mode?: string; reference?: string; date?: string };
  presenceDuMois?: { joursOuvres?: number; joursPresents?: number; joursAbsents?: number };
  createdAt?: string;
}

const financierService = {
  getAll: (params?: Record<string, unknown>) =>
    api.get<FicheFinanciere[]>('/financier', { params: params as Record<string, string | number | boolean | undefined | null> }),

  getOne: (id: string) =>
    api.get<FicheFinanciere>(`/financier/${id}`),

  getByMilitaire: (militaireId: string) =>
    api.get<FicheFinanciere[]>(`/financier/militaire/${militaireId}`),

  create: (data: Partial<FicheFinanciere>) =>
    api.post<FicheFinanciere>('/financier', data),

  update: (id: string, data: Partial<FicheFinanciere>) =>
    api.put<FicheFinanciere>(`/financier/${id}`, data),

  approuver: (id: string) =>
    api.patch<FicheFinanciere>(`/financier/${id}/approuver`),

  marquerPaye: (id: string, paiement: { mode: string; reference?: string; date?: string }) =>
    api.patch<FicheFinanciere>(`/financier/${id}/payer`, { paiement }),

  getMasseSalariale: (params?: { mois?: number; annee?: number }) =>
    api.get<{ totalBrut: number; totalNet: number; totalDeductions: number; count: number }>('/financier/masse-salariale', { params }),

  delete: (id: string) =>
    api.delete(`/financier/${id}`),
};

export default financierService;
