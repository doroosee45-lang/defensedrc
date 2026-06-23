export type UserRole =
  | 'souverain'
  | 'super_admin'
  | 'admin_national'
  | 'admin_provincial'
  | 'admin_territorial'
  | 'admin_sectoriel'
  | 'officier_commandant'
  | 'utilisateur_operationnel'

export type StatutMilitaire =
  | 'actif'
  | 'en_mission'
  | 'en_formation'
  | 'en_permission'
  | 'en_reserve'
  | 'retraite'
  | 'blesse'
  | 'suspendu'
  | 'decede'
  | 'deserteur'

export type StatutMission =
  | 'planifiee'
  | 'en_cours'
  | 'suspendue'
  | 'terminee'
  | 'annulee'

export type TypeMission =
  | 'patrouille'
  | 'securisation'
  | 'offensive'
  | 'humanitaire'
  | 'formation'
  | 'reconnaissance'
  | 'soutien'

export type NiveauAlerte = 'critique' | 'haute' | 'moyenne' | 'basse' | 'info'

export interface User {
  id: string
  matricule: string
  nom: string
  prenom: string
  role: UserRole
  grade: string
  unite: string
  province: string
  avatar?: string
  dernierConnexion: string
}

export interface Militaire {
  id: string
  matricule: string
  nom: string
  postnom: string
  prenom: string
  photo?: string
  dateNaissance: string
  sexe: 'M' | 'F'
  nationalite: string
  provinceOrigine: string
  adresse: string
  telephone: string
  groupeSanguin: string
  aptitudePhysique: 'apte' | 'apte_restriction' | 'inapte'
  grade: string
  corps: string
  arme: string
  unite: string
  provinceAffectation: string
  dateIntegration: string
  statut: StatutMilitaire
  allergies?: string
  numeroCarteMillitaire: string
}

export type ForceType = 'terrestre' | 'aerienne' | 'maritime' | 'emg'

export interface Grade {
  id: string
  code: string
  nom: string
  abreviation: string
  corps: string
  niveau: number
  categorieOfficier: 'officier_general' | 'officier_superieur' | 'officier_subalterne' | 'sous_officier' | 'homme_rang'
  indiciaire: number
  anneesAncienneteMin: number
}

export interface Unite {
  id: string
  code: string
  nom: string
  force?: ForceType
  type:
    // Institution / commandement
    | 'emg' | 'commandement' | 'direction' | 'force'
    // Force Terrestre
    | 'zone' | 'region' | 'division' | 'brigade' | 'regiment'
    | 'bataillon' | 'compagnie' | 'peloton' | 'section' | 'escouade' | 'base'
    // Force Aérienne
    | 'region_aerienne' | 'base_aerienne' | 'escadre' | 'groupe_aerien'
    | 'escadron' | 'flottille' | 'detachement'
    // Force Maritime
    | 'region_navale' | 'base_navale' | 'flotte' | 'escadre_navale' | 'escadron_naval'
  provinces?: string[]
  corpsSpecialise?: string
  commandant?: string
  effectifMax: number
  effectifActuel: number
  province: string
  localisation: string
  parentId?: string
  coordonnees?: { lat: number; lng: number }
  statut: 'operationnelle' | 'en_operations' | 'en_formation' | 'au_repos'
}

export interface Mission {
  id: string
  code: string
  nom: string
  type: TypeMission
  objectif: string
  zone: string
  responsable: string
  unitesPrincipales: string[]
  effectifEngage: number
  dateDebut: string
  dateFin?: string
  statut: StatutMission
  province: string
  priorite: 'critique' | 'haute' | 'normale'
  pertesCombat?: number
  blesses?: number
  coordonnees?: { lat: number; lng: number }
}

export interface Vehicule {
  id: string
  immatriculation: string
  marque: string
  modele: string
  type: 'blinde' | 'camion' | 'vehicule_leger' | 'moto' | 'commandement' | 'bateau' | 'drone'
  annee: number
  unite: string
  statut: 'operationnel' | 'en_mission' | 'maintenance' | 'hs' | 'en_reparation'
  kilometrage: number
  derniereMaintenance: string
  prochaineMaintenance: string
  carburant: number
  conducteurActuel?: string
  coordonnees?: { lat: number; lng: number }
}

export interface Equipement {
  id: string
  numeroSerie: string
  designation: string
  categorie: 'armement' | 'communication' | 'protection' | 'medical' | 'informatique' | 'vehicule' | 'drone' | 'munitions' | 'grenade' | 'autre'
  sousCategorie: string
  statut: 'disponible' | 'attribue' | 'maintenance' | 'hors_service' | 'en_transit' | 'perdu'
  unite: string
  baseStockage?: string
  attribueA?: string
  dateAcquisition: string
  valeur: number
  etat: 'excellent' | 'bon' | 'acceptable' | 'mauvais'
  classification?: 'standard' | 'sensible' | 'tres_sensible'
  quantiteStock?: number
}

export interface Permission {
  id: string
  militaireId: string
  militaireNom: string
  matricule: string
  grade: string
  unite: string
  type: 'conge_annuel' | 'conge_maladie' | 'permission_exceptionnelle' | 'repos_compensateur'
  dateDebut: string
  dateFin: string
  motif: string
  statut: 'en_attente' | 'approuve' | 'refuse' | 'en_cours' | 'terminee'
  validePar?: string
  dateValidation?: string
  commentaire?: string
}

export interface Presence {
  id: string
  militaireId: string
  militaireNom: string
  matricule: string
  grade: string
  unite: string
  date: string
  arrivee?: string
  depart?: string
  statut: 'present' | 'absent' | 'retard' | 'mission' | 'permission' | 'conge_maladie'
  methode: 'biometrique' | 'gps' | 'manuel'
  observation?: string
}

export interface DossierMedical {
  id: string
  militaireId: string
  militaireNom: string
  matricule: string
  groupeSanguin: string
  allergies: string[]
  vaccinations: Array<{
    nom: string
    date: string
    prochainRappel?: string
    statut: 'a_jour' | 'en_retard' | 'planifie'
  }>
  aptitudePhysique: 'apte' | 'apte_restriction' | 'inapte'
  dateEvaluation: string
  antecedents: string
  blessures: Array<{
    date: string
    description: string
    type: 'combat' | 'accident' | 'maladie'
    sequelles?: string
  }>
  statut: 'actif' | 'hospitalise' | 'evacuation_sanitaire' | 'convalescence'
}

export interface DossierDisciplinaire {
  id: string
  militaireId: string
  militaireNom: string
  matricule: string
  grade: string
  unite: string
  type: 'infraction' | 'sanction' | 'distinction'
  categorie: string
  description: string
  date: string
  statut: 'ouvert' | 'en_cours' | 'clos' | 'appel'
  sanction?: string
  decidePar?: string
  dateDecision?: string
}

export interface FicheFinanciere {
  id: string
  militaireId: string
  militaireNom: string
  matricule: string
  grade: string
  unite: string
  mois: string
  annee: number
  salaireBase: number
  primeMission: number
  primeRisque: number
  primeAnciennete: number
  primeSpecialite: number
  deductions: number
  netAPayer: number
  statut: 'calcule' | 'valide' | 'paye' | 'litige'
  dateVirement?: string
  modePaiement: 'virement' | 'especes' | 'mobile_money'
}

export interface Message {
  id: string
  expediteurId: string
  expediteurNom: string
  expediteurGrade: string
  destinataireId?: string
  destinataireNom?: string
  groupeId?: string
  groupeNom?: string
  contenu: string
  pieceJointe?: string
  dateEnvoi: string
  lu: boolean
  priorite: 'normale' | 'urgente' | 'critique' | 'haute'
  chiffre: boolean
}

export interface Document {
  id: string
  titre: string
  type: 'ordre' | 'rapport' | 'directive' | 'note' | 'procedure' | 'formulaire' | 'autre'
  classification: 'public' | 'restreint' | 'confidentiel' | 'secret'
  auteur: string
  unite: string
  dateCreation: string
  dateModification: string
  version: string
  statut: 'brouillon' | 'en_validation' | 'valide' | 'archive'
  taille: string
  telechargements: number
  signatureElectronique?: boolean
}

export interface AuditLog {
  id: string
  utilisateurId: string
  utilisateurNom: string
  utilisateurGrade: string
  action: 'consultation' | 'creation' | 'modification' | 'suppression' | 'export' | 'connexion' | 'deconnexion'
  module: string
  description: string
  objetConcerne?: string
  ancienneValeur?: string
  nouvelleValeur?: string
  timestamp: string
  adresseIp: string
  appareil: string
  province: string
  statut: 'succes' | 'echec' | 'suspect'
}

export interface Alerte {
  id: string
  titre: string
  description: string
  niveau: NiveauAlerte
  module: string
  province?: string
  unite?: string
  dateCreation: string
  dateLecture?: string
  statut: 'non_lue' | 'lue' | 'traitee' | 'fermee'
  destinataires: string[]
  source: string
}

export interface BaseMilitaire {
  id: string
  code: string
  nom: string
  type: 'base_principale' | 'base_avancee' | 'centre_formation' | 'depot_logistique' | 'poste_observation'
  province: string
  localisation: string
  commandant: string
  effectifGarnison: number
  capaciteMax: number
  niveauSecurite: 'securisee' | 'sous_surveillance' | 'compromise' | 'evacuee'
  coordonnees: { lat: number; lng: number }
  stocksMateriel: {
    armementLeger: number
    armementLourd: number
    munitions: number
    drones: number
    vehicules: number
    grenades: number
  }
  certificationEnvoi: boolean
  statut: 'operationnelle' | 'degradee' | 'hors_service'
  derniereInspection: string
}

export interface CentreFormation {
  id: string
  code: string
  nom: string
  province: string
  localisation: string
  directeur: string
  capaciteAccueil: number
  stagiairesActuels: number
  specialites: string[]
  formations: Array<{
    id: string
    intitule: string
    dureeJours: number
    nbParticipants: number
    dateDebut: string
    dateFin: string
    statut: 'en_cours' | 'planifiee' | 'terminee'
  }>
  niveauSecurite: 'securisee' | 'sous_surveillance' | 'compromise'
  coordonnees: { lat: number; lng: number }
  statut: 'actif' | 'inactif' | 'en_construction'
}

export type StatutTransfert =
  | 'en_preparation'
  | 'validation_securite'
  | 'approuve'
  | 'en_transit'
  | 'livre'
  | 'deviation_alerte'
  | 'annule'

export interface TransfertLogistique {
  id: string
  code: string
  baseOrigineId: string
  baseOrigineNom: string
  baseOrigineSecurite: 'securisee' | 'sous_surveillance' | 'compromise' | 'evacuee'
  baseDestinationId: string
  baseDestinationNom: string
  materiels: Array<{
    categorie: 'armement_leger' | 'armement_lourd' | 'munitions' | 'drone' | 'vehicule' | 'grenades' | 'materiel_divers'
    designation: string
    quantite: number
    unite: string
    classification: 'standard' | 'sensible' | 'tres_sensible'
  }>
  responsableTransport: string
  effectifEscorte: number
  vehiculesConvoi: string[]
  dateDepart?: string
  dateLivraisonPrevue: string
  dateLivraisonReelle?: string
  statut: StatutTransfert
  routePlanifiee: Array<{ lat: number; lng: number; checkpoint?: string }>
  positionActuelle?: { lat: number; lng: number; vitesse?: number }
  deviationDetectee: boolean
  deviationDistance?: number
  distanceParcourue?: number
  distanceTotale?: number
  validationSecurite?: {
    validePar: string
    date: string
    statut: 'approuve' | 'refuse' | 'en_attente'
    commentaire?: string
  }
  priorite: 'normale' | 'urgente' | 'critique'
  alerteGPS?: {
    type: 'deviation' | 'zone_dangereuse' | 'arret_suspect'
    description: string
    timestamp: string
    position: { lat: number; lng: number }
  }
  notes?: string
}

export interface StatistiquesNationales {
  effectifTotal: number
  effectifActifs: number
  effectifEnMission: number
  effectifEnFormation: number
  effectifEnPermission: number
  effectifBlesses: number
  effectifRetraites: number
  missionsActives: number
  vehiculesOperationnels: number
  vehiculesMaintenance: number
  alertesCritiques: number
  equipementsDisponibles: number
}
