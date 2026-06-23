import api from '@/lib/apiClient';

export interface DashboardStats {
  personnel: {
    total: number;
    actif: number;
    enMission: number;
    enFormation: number;
    parForce: { _id: string; count: number }[];
  };
  operations: {
    actives: number;
    parType: { _id: string; count: number }[];
  };
  vehicules: {
    total: number;
    disponibles: number;
    tauxDisponibilite: number;
  };
  alertes: {
    total: number;
    critiques: number;
  };
}

const rapportsService = {
  getDashboard: () =>
    api.get<DashboardStats>('/rapports/dashboard'),

  getPersonnelReport: (annee?: number) =>
    api.get('/rapports/personnel', { params: annee ? { annee } : undefined }),

  getOperationsReport: (annee?: number) =>
    api.get('/rapports/operations', { params: annee ? { annee } : undefined }),

  getFinancierReport: (annee?: number) =>
    api.get('/rapports/financier', { params: annee ? { annee } : undefined }),
};

export default rapportsService;
