import api from '@/lib/apiClient';

export interface DossierMedical {
  _id: string;
  militaire: { _id: string; nom: string; prenom: string; matricule: string } | string;
  groupeSanguin?: string;
  allergies?: string[];
  maladiesChroniques?: string[];
  aptitudeMedicale: string;
  dateVisiteMedicale?: string;
  prochaineDateVisite?: string;
  vaccinations?: { vaccin: string; date: string; prochaineDose?: string }[];
  antecedentsMedicaux?: { type: string; description: string; date: string }[];
  blessuresOperation?: { description: string; date: string; severite: string }[];
  consultations?: { date: string; medecin?: string; motif: string; diagnostic?: string; traitement?: string }[];
  indiceSante?: number;
  notes?: string;
}

const medicalService = {
  getAll: (params?: Record<string, unknown>) =>
    api.get<DossierMedical[]>('/medical', { params: params as Record<string, string | number | boolean | undefined | null> }),

  getOne: (id: string) =>
    api.get<DossierMedical>(`/medical/${id}`),

  getByMilitaire: (militaireId: string) =>
    api.get<DossierMedical>(`/medical/militaire/${militaireId}`),

  create: (data: Partial<DossierMedical>) =>
    api.post<DossierMedical>('/medical', data),

  update: (id: string, data: Partial<DossierMedical>) =>
    api.put<DossierMedical>(`/medical/${id}`, data),

  addVaccination: (id: string, vaccination: { vaccin: string; date: string; prochaineDose?: string; lot?: string }) =>
    api.post<DossierMedical>(`/medical/${id}/vaccination`, vaccination),

  addConsultation: (id: string, consultation: { date: string; medecin?: string; motif: string; diagnostic?: string; traitement?: string }) =>
    api.post<DossierMedical>(`/medical/${id}/consultation`, consultation),

  updateAptitude: (id: string, data: { aptitudeMedicale: string; dateVisiteMedicale?: string; prochaineDateVisite?: string; notes?: string }) =>
    api.patch<DossierMedical>(`/medical/${id}/aptitude`, data),

  delete: (id: string) =>
    api.delete(`/medical/${id}`),
};

export default medicalService;
