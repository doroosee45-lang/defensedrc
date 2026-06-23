import api from '@/lib/apiClient';

export interface PositionPersonnel {
  _id: string;
  nom: string;
  prenom: string;
  matricule: string;
  gradeNom?: string;
  uniteNom?: string;
  statut: string;
  photo?: string;
  positionGPS: { lat: number; lng: number; derniereMAJ?: string };
}

export interface PositionVehicule {
  _id: string;
  immatriculation: string;
  designation: string;
  type: string;
  statut: string;
  positionGPS: { lat: number; lng: number; vitesse?: number; derniereMAJ?: string };
}

const geolocalisationService = {
  getAllPositions: () =>
    api.get<{ personnel: PositionPersonnel[]; vehicules: PositionVehicule[]; transferts: unknown[] }>('/geolocalisation/all'),

  getPersonnelPositions: (params?: { unite?: string }) =>
    api.get<PositionPersonnel[]>('/geolocalisation/personnel', { params }),

  getVehiclesPositions: (params?: { statut?: string }) =>
    api.get<PositionVehicule[]>('/geolocalisation/vehicules', { params }),

  updatePersonnelPosition: (id: string, pos: { lat: number; lng: number; precision?: number }) =>
    api.patch(`/geolocalisation/personnel/${id}`, pos),

  updateVehiculePosition: (id: string, pos: { lat: number; lng: number; vitesse?: number; direction?: number }) =>
    api.patch(`/geolocalisation/vehicules/${id}`, pos),
};

export default geolocalisationService;
