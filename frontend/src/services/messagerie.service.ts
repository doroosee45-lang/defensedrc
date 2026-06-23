import api from '@/lib/apiClient';

export interface Message {
  _id: string;
  expediteur: { _id: string; nom: string; prenom: string; matricule: string; role?: string } | string;
  destinataires?: { _id: string; nom: string; prenom: string; matricule: string }[];
  destinatairesUnites?: { _id: string; nom: string; code: string }[];
  typeDestinataire: 'individuel' | 'unite' | 'broadcast';
  sujet: string;
  contenu: string;
  contenuChiffre?: boolean;
  priorite: 'critique' | 'haute' | 'normale' | 'basse';
  type: string;
  classification?: string;
  pieceJointes?: { nom: string; type: string; taille: number; url: string }[];
  lu?: { utilisateur: string; dateLecture: string }[];
  isLu?: boolean;
  repondA?: { _id: string; sujet: string } | string;
  archive?: boolean;
  createdAt?: string;
}

const messagerieService = {
  getInbox: (params?: Record<string, unknown>) =>
    api.get<Message[]>('/messagerie/inbox', { params: params as Record<string, string | number | boolean | undefined | null> }),

  getSent: (params?: Record<string, unknown>) =>
    api.get<Message[]>('/messagerie/sent', { params: params as Record<string, string | number | boolean | undefined | null> }),

  getOne: (id: string) =>
    api.get<Message>(`/messagerie/${id}`),

  getNonLus: () =>
    api.get<{ count: number }>('/messagerie/non-lus'),

  send: (data: {
    destinataires?: string[];
    destinatairesUnites?: string[];
    typeDestinataire: string;
    sujet: string;
    contenu: string;
    priorite?: string;
    type?: string;
    classification?: string;
    repondA?: string;
  }) =>
    api.post<Message>('/messagerie', data),

  archive: (id: string) =>
    api.patch<void>(`/messagerie/${id}/archive`),

  delete: (id: string) =>
    api.delete(`/messagerie/${id}`),
};

export default messagerieService;
