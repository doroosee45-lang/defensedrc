import type {
  Militaire, Grade, Unite, Mission, Vehicule, Equipement,
  Permission, Presence, DossierMedical, DossierDisciplinaire,
  FicheFinanciere, Message, Document, AuditLog, Alerte, User,
  BaseMilitaire, CentreFormation, TransfertLogistique
} from '@/types'

export const currentUser: User = {
  id: 'USR-001',
  matricule: 'FARDC-2019-00001',
  nom: 'KABILA',
  prenom: 'Jean-Pierre',
  role: 'admin_national',
  grade: 'Général de Brigade',
  unite: 'État-Major Général',
  province: 'Kinshasa',
  dernierConnexion: '2025-06-23T07:42:00Z',
}

// ── Grades — Table officielle FARDC complète ─────────────────────────────────
export const grades: Grade[] = [
  // Officiers généraux ──────────────────────────────────────────────────────
  { id: 'G01', code: 'GA',   nom: 'Général d\'Armée',          abreviation: 'Gal A',    corps: 'Toutes forces', niveau: 19, categorieOfficier: 'officier_general',    indiciaire: 2500, anneesAncienneteMin: 35 },
  { id: 'G02', code: 'GCA',  nom: 'Général de Corps d\'Armée', abreviation: 'Gal CA',   corps: 'Toutes forces', niveau: 18, categorieOfficier: 'officier_general',    indiciaire: 2200, anneesAncienneteMin: 30 },
  { id: 'G03', code: 'LTGL', nom: 'Lieutenant-Général',        abreviation: 'Lt Gal',   corps: 'Toutes forces', niveau: 17, categorieOfficier: 'officier_general',    indiciaire: 1950, anneesAncienneteMin: 27 },
  { id: 'G04', code: 'GM',   nom: 'Général-Major',             abreviation: 'Gal Maj',  corps: 'Toutes forces', niveau: 16, categorieOfficier: 'officier_general',    indiciaire: 1700, anneesAncienneteMin: 24 },
  { id: 'G05', code: 'GBD',  nom: 'Général de Brigade',        abreviation: 'Gal Bde',  corps: 'Toutes forces', niveau: 15, categorieOfficier: 'officier_general',    indiciaire: 1450, anneesAncienneteMin: 21 },
  // Officiers supérieurs ────────────────────────────────────────────────────
  { id: 'G06', code: 'COL',  nom: 'Colonel',                   abreviation: 'Col',      corps: 'Toutes forces', niveau: 12, categorieOfficier: 'officier_superieur',  indiciaire: 1200, anneesAncienneteMin: 18 },
  { id: 'G07', code: 'LTC',  nom: 'Lieutenant-Colonel',        abreviation: 'LtCol',    corps: 'Toutes forces', niveau: 11, categorieOfficier: 'officier_superieur',  indiciaire: 1000, anneesAncienneteMin: 15 },
  { id: 'G08', code: 'CDT',  nom: 'Commandant',                abreviation: 'Cdt',      corps: 'Toutes forces', niveau: 10, categorieOfficier: 'officier_superieur',  indiciaire: 840,  anneesAncienneteMin: 12 },
  // Officiers subalternes ───────────────────────────────────────────────────
  { id: 'G09', code: 'CPT',  nom: 'Capitaine',                 abreviation: 'Cpt',      corps: 'Toutes forces', niveau: 9,  categorieOfficier: 'officier_subalterne', indiciaire: 700,  anneesAncienneteMin: 8 },
  { id: 'G10', code: 'LT',   nom: 'Lieutenant',                abreviation: 'Lt',       corps: 'Toutes forces', niveau: 8,  categorieOfficier: 'officier_subalterne', indiciaire: 580,  anneesAncienneteMin: 5 },
  { id: 'G11', code: 'SLT',  nom: 'Sous-Lieutenant',           abreviation: 'SLt',      corps: 'Toutes forces', niveau: 7,  categorieOfficier: 'officier_subalterne', indiciaire: 480,  anneesAncienneteMin: 2 },
  // Sous-officiers supérieurs ───────────────────────────────────────────────
  { id: 'G12', code: 'ADC',  nom: 'Adjudant-Chef',             abreviation: 'Adj Ch',   corps: 'Toutes forces', niveau: 6,  categorieOfficier: 'sous_officier',       indiciaire: 400,  anneesAncienneteMin: 16 },
  { id: 'G13', code: 'ADJ',  nom: 'Adjudant',                  abreviation: 'Adj',      corps: 'Toutes forces', niveau: 5,  categorieOfficier: 'sous_officier',       indiciaire: 350,  anneesAncienneteMin: 12 },
  // Sous-officiers subalternes ──────────────────────────────────────────────
  { id: 'G14', code: 'SGM',  nom: 'Sergent-Major',             abreviation: 'Sgt Maj',  corps: 'Toutes forces', niveau: 4,  categorieOfficier: 'sous_officier',       indiciaire: 300,  anneesAncienneteMin: 8 },
  { id: 'G15', code: 'SGT',  nom: 'Sergent',                   abreviation: 'Sgt',      corps: 'Toutes forces', niveau: 3,  categorieOfficier: 'sous_officier',       indiciaire: 260,  anneesAncienneteMin: 5 },
  // Hommes du rang ──────────────────────────────────────────────────────────
  { id: 'G16', code: 'CPC',  nom: 'Caporal-Chef',              abreviation: 'Cpl Ch',   corps: 'Toutes forces', niveau: 2,  categorieOfficier: 'homme_rang',          indiciaire: 220,  anneesAncienneteMin: 3 },
  { id: 'G17', code: 'CPL',  nom: 'Caporal',                   abreviation: 'Cpl',      corps: 'Toutes forces', niveau: 2,  categorieOfficier: 'homme_rang',          indiciaire: 200,  anneesAncienneteMin: 2 },
  { id: 'G18', code: 'SDT1', nom: 'Soldat de 1ère Classe',     abreviation: 'Sdt 1Cl',  corps: 'Toutes forces', niveau: 1,  categorieOfficier: 'homme_rang',          indiciaire: 180,  anneesAncienneteMin: 1 },
  { id: 'G19', code: 'SDT2', nom: 'Soldat de 2ème Classe',     abreviation: 'Sdt 2Cl',  corps: 'Toutes forces', niveau: 1,  categorieOfficier: 'homme_rang',          indiciaire: 165,  anneesAncienneteMin: 0 },
]

export const unites: Unite[] = [

  // ═══════════════════════════════════════════════════════════════════════════
  // NIVEAU 1 — INSTITUTION : FORCES ARMÉES / ÉTAT-MAJOR GÉNÉRAL
  // ═══════════════════════════════════════════════════════════════════════════
  { id: 'U00', code: 'EMG',   nom: 'État-Major Général des FARDC',          force: 'emg',       type: 'emg',         commandant: 'Gal A. KABUNDI Jean-Christophe', effectifMax: 1200, effectifActuel: 1085, province: 'Kinshasa', localisation: 'Kinshasa — Camp Tshatshi', statut: 'operationnelle' },

  // Commandements et directions (rattachés à l'EMG)
  { id: 'D01', code: 'CEMG',  nom: 'Cabinet du Chef d\'État-Major Général',  force: 'emg',       type: 'commandement', effectifMax: 120, effectifActuel: 108, province: 'Kinshasa', localisation: 'Kinshasa', parentId: 'U00', statut: 'operationnelle' },
  { id: 'D02', code: 'COPS',  nom: 'Commandement des Opérations',            force: 'emg',       type: 'commandement', effectifMax: 350, effectifActuel: 310, province: 'Kinshasa', localisation: 'Kinshasa', parentId: 'U00', statut: 'operationnelle' },
  { id: 'D03', code: 'CLOG',  nom: 'Commandement Logistique',                force: 'emg',       type: 'commandement', effectifMax: 280, effectifActuel: 255, province: 'Kinshasa', localisation: 'Kinshasa', parentId: 'U00', statut: 'operationnelle' },
  { id: 'D04', code: 'DRH',   nom: 'Direction des Ressources Humaines',      force: 'emg',       type: 'direction',    effectifMax: 200, effectifActuel: 182, province: 'Kinshasa', localisation: 'Kinshasa', parentId: 'U00', statut: 'operationnelle' },
  { id: 'D05', code: 'DFIN',  nom: 'Direction des Finances',                 force: 'emg',       type: 'direction',    effectifMax: 180, effectifActuel: 165, province: 'Kinshasa', localisation: 'Kinshasa', parentId: 'U00', statut: 'operationnelle' },
  { id: 'D06', code: 'DRENS', nom: 'Direction des Renseignements',           force: 'emg',       type: 'direction',    effectifMax: 220, effectifActuel: 198, province: 'Kinshasa', localisation: 'Kinshasa', parentId: 'U00', statut: 'operationnelle' },
  { id: 'D07', code: 'DSI',   nom: 'Direction des Systèmes d\'Information',  force: 'emg',       type: 'direction',    effectifMax: 150, effectifActuel: 134, province: 'Kinshasa', localisation: 'Kinshasa', parentId: 'U00', statut: 'operationnelle' },
  { id: 'D08', code: 'DTRN',  nom: 'Direction des Transmissions',            force: 'emg',       type: 'direction',    effectifMax: 160, effectifActuel: 148, province: 'Kinshasa', localisation: 'Kinshasa', parentId: 'U00', statut: 'operationnelle' },
  { id: 'D09', code: 'DSM',   nom: 'Direction de la Santé Militaire',        force: 'emg',       type: 'direction',    effectifMax: 400, effectifActuel: 372, province: 'Kinshasa', localisation: 'Kinshasa', parentId: 'U00', statut: 'operationnelle' },
  { id: 'D10', code: 'DJM',   nom: 'Direction de la Justice Militaire',      force: 'emg',       type: 'direction',    effectifMax: 140, effectifActuel: 128, province: 'Kinshasa', localisation: 'Kinshasa', parentId: 'U00', statut: 'operationnelle' },
  { id: 'D11', code: 'INSP',  nom: 'Inspection Générale des FARDC',          force: 'emg',       type: 'commandement', effectifMax: 90,  effectifActuel: 82,  province: 'Kinshasa', localisation: 'Kinshasa', parentId: 'U00', statut: 'operationnelle' },

  // ═══════════════════════════════════════════════════════════════════════════
  // NIVEAU 2A — FORCE TERRESTRE
  // ═══════════════════════════════════════════════════════════════════════════
  { id: 'FT',  code: 'FT',    nom: 'Force Terrestre',                        force: 'terrestre', type: 'force',       commandant: 'Gal Corps MWAMBA Jean-Pierre', effectifMax: 180000, effectifActuel: 155280, province: 'Kinshasa', localisation: 'Kinshasa', parentId: 'U00', statut: 'operationnelle' },

  // — 1ère Zone de Défense (Kinshasa) ——————————————————————————————————————
  { id: 'Z1',  code: 'ZD1',   nom: '1ère Zone de Défense (Kinshasa)',        force: 'terrestre', type: 'zone',        commandant: 'Gal Corps LUZOLO Gaston',         effectifMax: 48000, effectifActuel: 41320, province: 'Kinshasa', localisation: 'Kinshasa', parentId: 'FT', coordonnees: { lat: -4.32, lng: 15.32 }, statut: 'operationnelle' },
  { id: 'R11', code: 'RM-11', nom: '11e Région Militaire',                   force: 'terrestre', type: 'region',      commandant: 'Gal Bde NZINGA Marcel',           effectifMax: 12000, effectifActuel: 9840,  province: 'Kwilu', localisation: 'Kikwit',    parentId: 'Z1', provinces: ['Kwango', 'Kwilu', 'Mai-Ndombe'], coordonnees: { lat: -5.04, lng: 18.82 }, statut: 'operationnelle' },
  { id: 'R12', code: 'RM-12', nom: '12e Région Militaire',                   force: 'terrestre', type: 'region',      commandant: 'Gal Bde NSIMBA Gaston',           effectifMax: 8000,  effectifActuel: 6750,  province: 'Kongo-Central', localisation: 'Matadi',    parentId: 'Z1', provinces: ['Kongo-Central'], coordonnees: { lat: -5.82, lng: 13.45 }, statut: 'operationnelle' },
  { id: 'R13', code: 'RM-13', nom: '13e Région Militaire',                   force: 'terrestre', type: 'region',      commandant: 'Gal Bde BOSENGE Alphonse',        effectifMax: 10000, effectifActuel: 8120,  province: 'Équateur', localisation: 'Mbandaka',    parentId: 'Z1', provinces: ['Équateur', 'Mongala', 'Nord-Ubangi', 'Sud-Ubangi', 'Tshuapa'], coordonnees: { lat: 0.05, lng: 18.26 }, statut: 'operationnelle' },
  { id: 'R14', code: 'RM-14', nom: '14e Région Militaire',                   force: 'terrestre', type: 'region',      commandant: 'Gal Bde LUSAMBA Claude',          effectifMax: 18000, effectifActuel: 16610, province: 'Kinshasa', localisation: 'Kinshasa',   parentId: 'Z1', provinces: ['Kinshasa'], coordonnees: { lat: -4.32, lng: 15.32 }, statut: 'operationnelle' },

  // — 2ème Zone de Défense (Lubumbashi) ————————————————————————————————————
  { id: 'Z2',  code: 'ZD2',   nom: '2ème Zone de Défense (Lubumbashi)',      force: 'terrestre', type: 'zone',        commandant: 'Gal Corps ILUNGA Robert',         effectifMax: 32000, effectifActuel: 27640, province: 'Haut-Katanga', localisation: 'Lubumbashi', parentId: 'FT', coordonnees: { lat: -11.66, lng: 27.47 }, statut: 'operationnelle' },
  { id: 'R21', code: 'RM-21', nom: '21e Région Militaire',                   force: 'terrestre', type: 'region',      commandant: 'Gal Bde TSHIMANGA André',         effectifMax: 14000, effectifActuel: 11890, province: 'Kasaï Oriental', localisation: 'Mbuji-Mayi', parentId: 'Z2', provinces: ['Kasaï', 'Kasaï Central', 'Kasaï Oriental', 'Lomami', 'Sankuru'], coordonnees: { lat: -6.15, lng: 23.60 }, statut: 'operationnelle' },
  { id: 'R22', code: 'RM-22', nom: '22e Région Militaire',                   force: 'terrestre', type: 'region',      commandant: 'Gal Bde KABONGO Joseph',          effectifMax: 18000, effectifActuel: 15750, province: 'Haut-Katanga', localisation: 'Lubumbashi', parentId: 'Z2', provinces: ['Haut-Lomami', 'Haut-Katanga', 'Lualaba', 'Tanganyika'], coordonnees: { lat: -11.66, lng: 27.47 }, statut: 'operationnelle' },

  // — 3ème Zone de Défense (Est) ———————————————————————————————————————————
  { id: 'Z3',  code: 'ZD3',   nom: '3ème Zone de Défense (Est)',             force: 'terrestre', type: 'zone',        commandant: 'Gal Corps KAZADI Denis',          effectifMax: 55000, effectifActuel: 48720, province: 'Tshopo', localisation: 'Kisangani', parentId: 'FT', coordonnees: { lat: 0.52, lng: 25.19 }, statut: 'en_operations' },
  { id: 'R31', code: 'RM-31', nom: '31e Région Militaire',                   force: 'terrestre', type: 'region',      commandant: 'Gal Bde EKANGA Pierre',           effectifMax: 10000, effectifActuel: 8560,  province: 'Tshopo', localisation: 'Kisangani',  parentId: 'Z3', provinces: ['Bas-Uele', 'Tshopo'], coordonnees: { lat: 0.52, lng: 25.19 }, statut: 'operationnelle' },
  { id: 'R32', code: 'RM-32', nom: '32e Région Militaire',                   force: 'terrestre', type: 'region',      commandant: 'Gal Bde FATAKI Simon',            effectifMax: 12000, effectifActuel: 10240, province: 'Ituri', localisation: 'Bunia',      parentId: 'Z3', provinces: ['Haut-Uele', 'Ituri'], coordonnees: { lat: 1.55, lng: 30.25 }, statut: 'en_operations' },
  { id: 'R33', code: 'RM-33', nom: '33e Région Militaire',                   force: 'terrestre', type: 'region',      commandant: 'Gal Bde LIKAMBO Henri',           effectifMax: 13000, effectifActuel: 11870, province: 'Sud-Kivu', localisation: 'Bukavu',   parentId: 'Z3', provinces: ['Maniema', 'Sud-Kivu'], coordonnees: { lat: -2.49, lng: 28.85 }, statut: 'en_operations' },
  { id: 'R34', code: 'RM-34', nom: '34e Région Militaire',                   force: 'terrestre', type: 'region',      commandant: 'Gal Bde MUTEBA Patrice',          effectifMax: 20000, effectifActuel: 18050, province: 'Nord-Kivu', localisation: 'Goma',   parentId: 'Z3', provinces: ['Nord-Kivu'], coordonnees: { lat: -1.67, lng: 29.22 }, statut: 'en_operations' },

  // — Brigades, Bataillons, Bases (FT) ————————————————————————————————————
  { id: 'U06', code: 'BDE-101', nom: '101ème Brigade d\'Infanterie',         force: 'terrestre', type: 'brigade',     commandant: 'Col NZUZI Patrick',    effectifMax: 3000, effectifActuel: 2756, province: 'Nord-Kivu', localisation: 'Goma',    parentId: 'R34', coordonnees: { lat: -1.65, lng: 29.22 }, statut: 'en_operations' },
  { id: 'U07', code: 'BDE-102', nom: '102ème Brigade d\'Infanterie',         force: 'terrestre', type: 'brigade',     commandant: 'Col NGOMA Théodore',   effectifMax: 3000, effectifActuel: 2901, province: 'Sud-Kivu', localisation: 'Bukavu',  parentId: 'R33', coordonnees: { lat: -2.49, lng: 28.85 }, statut: 'en_operations' },
  { id: 'U06B', code: 'BDE-211', nom: '211ème Brigade d\'Infanterie',        force: 'terrestre', type: 'brigade',     commandant: 'Col TSHILOMBO Paul',   effectifMax: 3000, effectifActuel: 2540, province: 'Kasaï Oriental', localisation: 'Mbuji-Mayi', parentId: 'R21', statut: 'operationnelle' },
  { id: 'U08', code: 'BTN-1011', nom: '1er Bataillon / 101ème Brigade',      force: 'terrestre', type: 'bataillon',   commandant: 'LtCol KABILA Jean',    effectifMax: 700,  effectifActuel: 654,  province: 'Nord-Kivu', localisation: 'Rutshuru', parentId: 'U06', coordonnees: { lat: -1.17, lng: 29.45 }, statut: 'en_operations' },
  { id: 'U09', code: 'BTN-1012', nom: '2ème Bataillon / 101ème Brigade',     force: 'terrestre', type: 'bataillon',   commandant: 'LtCol BOLAMBA Eric',   effectifMax: 700,  effectifActuel: 688,  province: 'Nord-Kivu', localisation: 'Masisi',   parentId: 'U06', coordonnees: { lat: -1.37, lng: 28.82 }, statut: 'en_operations' },
  { id: 'U10', code: 'BASE-KIN', nom: 'Base Militaire de Kinshasa (Camp Kokolo)', force: 'terrestre', type: 'base', commandant: 'Cdt NSIMBA Albert', effectifMax: 2000, effectifActuel: 1845, province: 'Kinshasa', localisation: 'Kinshasa', parentId: 'R14', coordonnees: { lat: -4.32, lng: 15.32 }, statut: 'operationnelle' },
  { id: 'U11', code: 'BASE-GOM', nom: 'Base Militaire de Goma',              force: 'terrestre', type: 'base',        commandant: 'Cdt FURAHA Victor',    effectifMax: 1500, effectifActuel: 1380, province: 'Nord-Kivu', localisation: 'Goma',    parentId: 'R34', coordonnees: { lat: -1.67, lng: 29.22 }, statut: 'en_operations' },
  { id: 'U12', code: 'BASE-LUB', nom: 'Base Militaire de Lubumbashi',        force: 'terrestre', type: 'base',        commandant: 'Cdt KASONGO René',     effectifMax: 1800, effectifActuel: 1650, province: 'Haut-Katanga', localisation: 'Lubumbashi', parentId: 'R22', statut: 'operationnelle' },

  // ═══════════════════════════════════════════════════════════════════════════
  // NIVEAU 2B — FORCE AÉRIENNE
  // ═══════════════════════════════════════════════════════════════════════════
  { id: 'FA',  code: 'FA',    nom: 'Force Aérienne',                         force: 'aerienne',  type: 'force',       commandant: 'Gal Bde MUAMBA Jean-Paul', effectifMax: 8500, effectifActuel: 6840, province: 'Kinshasa', localisation: 'Base Aérienne Ndolo — Kinshasa', parentId: 'U00', statut: 'operationnelle' },

  // — 1ère Région Aérienne (Ouest / Centre) ————————————————————————————————
  { id: 'RA1', code: 'RA-01', nom: '1ère Région Aérienne (Kinshasa)',        force: 'aerienne',  type: 'region_aerienne', commandant: 'Col LOKO Simon',        effectifMax: 3500, effectifActuel: 2860, province: 'Kinshasa', localisation: 'Kinshasa', parentId: 'FA', statut: 'operationnelle' },
  { id: 'BA1', code: 'BA-501', nom: 'Base Aérienne 501 — Ndolo (Kinshasa)',  force: 'aerienne',  type: 'base_aerienne',   commandant: 'Cdt MBALU Pierre',      effectifMax: 1200, effectifActuel: 1050, province: 'Kinshasa', localisation: 'Kinshasa — Ndolo', parentId: 'RA1', coordonnees: { lat: -4.30, lng: 15.35 }, statut: 'operationnelle' },
  { id: 'BA2', code: 'BA-502', nom: 'Base Aérienne 502 — Kamina',            force: 'aerienne',  type: 'base_aerienne',   commandant: 'Cdt KATUMBA Henri',     effectifMax: 900,  effectifActuel: 780,  province: 'Haut-Lomami', localisation: 'Kamina',          parentId: 'RA1', coordonnees: { lat: -8.64, lng: 25.25 }, statut: 'operationnelle' },
  { id: 'BA3', code: 'BA-503', nom: 'Base Aérienne 503 — Mbuji-Mayi',        force: 'aerienne',  type: 'base_aerienne',   commandant: 'Cdt ILUNGA Sylvestre',  effectifMax: 600,  effectifActuel: 510,  province: 'Kasaï Oriental', localisation: 'Mbuji-Mayi',    parentId: 'RA1', coordonnees: { lat: -6.13, lng: 23.57 }, statut: 'operationnelle' },

  // — 2ème Région Aérienne (Est) ———————————————————————————————————————————
  { id: 'RA2', code: 'RA-02', nom: '2ème Région Aérienne (Est)',             force: 'aerienne',  type: 'region_aerienne', commandant: 'Col FURAHA Michel',     effectifMax: 3000, effectifActuel: 2480, province: 'Nord-Kivu', localisation: 'Goma',    parentId: 'FA', statut: 'en_operations' },
  { id: 'BA4', code: 'BA-504', nom: 'Base Aérienne 504 — Goma',              force: 'aerienne',  type: 'base_aerienne',   commandant: 'Cdt SAFARI Jules',      effectifMax: 1100, effectifActuel: 960,  province: 'Nord-Kivu', localisation: 'Goma',           parentId: 'RA2', coordonnees: { lat: -1.67, lng: 29.24 }, statut: 'en_operations' },
  { id: 'BA5', code: 'BA-505', nom: 'Base Aérienne 505 — Kisangani',         force: 'aerienne',  type: 'base_aerienne',   commandant: 'Cdt LIKAMBO Paul',      effectifMax: 800,  effectifActuel: 670,  province: 'Tshopo', localisation: 'Kisangani',         parentId: 'RA2', coordonnees: { lat: 0.52, lng: 25.18 }, statut: 'operationnelle' },
  { id: 'BA6', code: 'BA-506', nom: 'Base Aérienne 506 — Lubumbashi',        force: 'aerienne',  type: 'base_aerienne',   commandant: 'Cdt MWAMBA Claude',     effectifMax: 700,  effectifActuel: 580,  province: 'Haut-Katanga', localisation: 'Lubumbashi',    parentId: 'RA2', coordonnees: { lat: -11.59, lng: 27.53 }, statut: 'operationnelle' },

  // ═══════════════════════════════════════════════════════════════════════════
  // NIVEAU 2C — FORCE MARITIME
  // ═══════════════════════════════════════════════════════════════════════════
  { id: 'FM',  code: 'FM',    nom: 'Force Maritime',                         force: 'maritime',  type: 'force',       commandant: 'Gal Bde BONSENGE Fidèle', effectifMax: 4200, effectifActuel: 3150, province: 'Kinshasa', localisation: 'Base Navale Kinshasa', parentId: 'U00', statut: 'operationnelle' },

  // — 1ère Région Navale (Fleuve Congo / Atlantique) ———————————————————————
  { id: 'RN1', code: 'RN-01', nom: '1ère Région Navale (Fleuve / Atlantique)', force: 'maritime', type: 'region_navale', commandant: 'Col NSAMBU Paul',        effectifMax: 1800, effectifActuel: 1380, province: 'Kinshasa', localisation: 'Kinshasa', parentId: 'FM', statut: 'operationnelle' },
  { id: 'BN1', code: 'BN-601', nom: 'Base Navale de Matadi (Atlantique)',     force: 'maritime',  type: 'base_navale',   commandant: 'Cdt LELO Victor',       effectifMax: 620,  effectifActuel: 480,  province: 'Kongo-Central', localisation: 'Matadi',  parentId: 'RN1', coordonnees: { lat: -5.83, lng: 13.46 }, statut: 'operationnelle' },
  { id: 'BN2', code: 'BN-602', nom: 'Base Navale de Kinshasa (Fleuve Congo)', force: 'maritime',  type: 'base_navale',   commandant: 'Cdt DIANGO René',       effectifMax: 750,  effectifActuel: 620,  province: 'Kinshasa', localisation: 'Kinshasa',    parentId: 'RN1', coordonnees: { lat: -4.29, lng: 15.30 }, statut: 'operationnelle' },
  { id: 'BN3', code: 'BN-603', nom: 'Base Navale de Mbandaka (Fleuve)',       force: 'maritime',  type: 'base_navale',   commandant: 'Cdt BOKANGA Marcel',    effectifMax: 430,  effectifActuel: 280,  province: 'Équateur', localisation: 'Mbandaka',    parentId: 'RN1', coordonnees: { lat: 0.04, lng: 18.27 }, statut: 'operationnelle' },

  // — 2ème Région Navale (Grands Lacs) ————————————————————————————————————
  { id: 'RN2', code: 'RN-02', nom: '2ème Région Navale (Grands Lacs)',       force: 'maritime',  type: 'region_navale', commandant: 'Col NYOTA Simon',        effectifMax: 2400, effectifActuel: 1770, province: 'Tanganyika', localisation: 'Kalemie', parentId: 'FM', statut: 'operationnelle' },
  { id: 'BN4', code: 'BN-604', nom: 'Base Navale de Kalemie (Lac Tanganyika)', force: 'maritime', type: 'base_navale',  commandant: 'Cdt KITENGE Bernard',   effectifMax: 720,  effectifActuel: 560,  province: 'Tanganyika', localisation: 'Kalemie', parentId: 'RN2', coordonnees: { lat: -5.93, lng: 29.19 }, statut: 'operationnelle' },
  { id: 'BN5', code: 'BN-605', nom: 'Base Navale de Goma (Lac Kivu)',         force: 'maritime',  type: 'base_navale',   commandant: 'Cdt MUHIWA David',      effectifMax: 580,  effectifActuel: 450,  province: 'Nord-Kivu', localisation: 'Goma',   parentId: 'RN2', coordonnees: { lat: -1.68, lng: 29.21 }, statut: 'en_operations' },
  { id: 'BN6', code: 'BN-606', nom: 'Base Navale de Bukavu (Lac Kivu)',       force: 'maritime',  type: 'base_navale',   commandant: 'Cdt KAYUMBA Alain',     effectifMax: 500,  effectifActuel: 380,  province: 'Sud-Kivu', localisation: 'Bukavu',  parentId: 'RN2', coordonnees: { lat: -2.49, lng: 28.86 }, statut: 'en_operations' },
  { id: 'BN7', code: 'BN-607', nom: 'Base Navale de Kisangani (Fleuve Lualaba)', force: 'maritime', type: 'base_navale', commandant: 'Cdt KONGOLO Serge',    effectifMax: 350,  effectifActuel: 280,  province: 'Tshopo', localisation: 'Kisangani', parentId: 'RN2', coordonnees: { lat: 0.50, lng: 25.20 }, statut: 'operationnelle' },
]

export const militaires: Militaire[] = [
  { id: 'M001', matricule: 'FARDC-2015-04521', nom: 'MUTOMBO', postnom: 'KASONGO', prenom: 'David', dateNaissance: '1985-03-15', sexe: 'M', nationalite: 'Congolaise', provinceOrigine: 'Kasaï', adresse: 'Camp Kokolo, Kinshasa', telephone: '+243810001122', groupeSanguin: 'O+', aptitudePhysique: 'apte', grade: 'Capitaine', corps: 'Infanterie', arme: 'Infanterie', unite: 'BTN-1011', provinceAffectation: 'Nord-Kivu', dateIntegration: '2015-01-10', statut: 'en_mission', numeroCarteMillitaire: 'CM-2015-04521' },
  { id: 'M002', matricule: 'FARDC-2018-07834', nom: 'LOKONDA', postnom: 'BOFAYA', prenom: 'Marie-Claire', dateNaissance: '1992-07-22', sexe: 'F', nationalite: 'Congolaise', provinceOrigine: 'Équateur', adresse: 'Goma, Nord-Kivu', telephone: '+243820003344', groupeSanguin: 'A+', aptitudePhysique: 'apte', grade: 'Lieutenant', corps: 'Médecine Militaire', arme: 'Médecine', unite: 'BDE-101', provinceAffectation: 'Nord-Kivu', dateIntegration: '2018-06-15', statut: 'actif', numeroCarteMillitaire: 'CM-2018-07834' },
  { id: 'M003', matricule: 'FARDC-2010-01293', nom: 'KABILA', postnom: 'MWAMBA', prenom: 'Patrick', dateNaissance: '1978-11-08', sexe: 'M', nationalite: 'Congolaise', provinceOrigine: 'Katanga', adresse: 'Bukavu, Sud-Kivu', telephone: '+243830005566', groupeSanguin: 'B+', aptitudePhysique: 'apte_restriction', grade: 'Lieutenant-Colonel', corps: 'Génie', arme: 'Génie', unite: 'BDE-102', provinceAffectation: 'Sud-Kivu', dateIntegration: '2010-03-20', statut: 'actif', numeroCarteMillitaire: 'CM-2010-01293' },
  { id: 'M004', matricule: 'FARDC-2020-11456', nom: 'NGOMA', postnom: 'LUVUA', prenom: 'Christophe', dateNaissance: '1998-05-30', sexe: 'M', nationalite: 'Congolaise', provinceOrigine: 'Maniema', adresse: 'Rutshuru, Nord-Kivu', telephone: '+243840007788', groupeSanguin: 'AB-', aptitudePhysique: 'apte', grade: 'Sergent', corps: 'Infanterie', arme: 'Infanterie', unite: 'BTN-1011', provinceAffectation: 'Nord-Kivu', dateIntegration: '2020-09-01', statut: 'blesse', numeroCarteMillitaire: 'CM-2020-11456' },
  { id: 'M005', matricule: 'FARDC-2012-03678', nom: 'TSHILOMBO', postnom: 'KASANSA', prenom: 'Bernadette', dateNaissance: '1988-12-14', sexe: 'F', nationalite: 'Congolaise', provinceOrigine: 'Kasaï Oriental', adresse: 'Kinshasa', telephone: '+243850009900', groupeSanguin: 'O-', aptitudePhysique: 'apte', grade: 'Commandant', corps: 'Renseignement', arme: 'Renseignement', unite: 'RM-14', provinceAffectation: 'Kinshasa', dateIntegration: '2012-07-15', statut: 'actif', numeroCarteMillitaire: 'CM-2012-03678' },
  { id: 'M006', matricule: 'FARDC-2008-00987', nom: 'LUKUSA', postnom: 'MBUMBA', prenom: 'Emmanuel', dateNaissance: '1975-02-28', sexe: 'M', nationalite: 'Congolaise', provinceOrigine: 'Bas-Congo', adresse: 'Lubumbashi', telephone: '+243860001122', groupeSanguin: 'A-', aptitudePhysique: 'apte', grade: 'Colonel', corps: 'Artillerie', arme: 'Artillerie', unite: 'RM-22', provinceAffectation: 'Haut-Katanga', dateIntegration: '2008-04-10', statut: 'actif', numeroCarteMillitaire: 'CM-2008-00987' },
  { id: 'M007', matricule: 'FARDC-2022-15678', nom: 'BOLAMBA', postnom: 'LOFOMBO', prenom: 'Théodore', dateNaissance: '2000-08-19', sexe: 'M', nationalite: 'Congolaise', provinceOrigine: 'Nord-Ubangi', adresse: 'Kisangani', telephone: '+243870003344', groupeSanguin: 'B-', aptitudePhysique: 'apte', grade: 'Soldat', corps: 'Infanterie', arme: 'Infanterie', unite: 'RM-31', provinceAffectation: 'Tshopo', dateIntegration: '2022-01-20', statut: 'en_formation', numeroCarteMillitaire: 'CM-2022-15678' },
  { id: 'M008', matricule: 'FARDC-2005-00234', nom: 'KASHAMA', postnom: 'NGOY', prenom: 'Richard', dateNaissance: '1972-06-07', sexe: 'M', nationalite: 'Congolaise', provinceOrigine: 'Katanga', adresse: 'Lubumbashi', telephone: '+243880005566', groupeSanguin: 'O+', aptitudePhysique: 'apte', grade: 'Général de Brigade', corps: 'Blindés', arme: 'Blindés', unite: 'RM-22', provinceAffectation: 'Haut-Katanga', dateIntegration: '2005-11-01', statut: 'actif', numeroCarteMillitaire: 'CM-2005-00234' },
  { id: 'M009', matricule: 'FARDC-2019-09876', nom: 'MWANGU', postnom: 'KALALA', prenom: 'Joséphine', dateNaissance: '1994-04-11', sexe: 'F', nationalite: 'Congolaise', provinceOrigine: 'Lomami', adresse: 'Goma, Nord-Kivu', telephone: '+243890007788', groupeSanguin: 'A+', aptitudePhysique: 'apte', grade: 'Sous-Lieutenant', corps: 'Transmission', arme: 'Transmission', unite: 'BDE-101', provinceAffectation: 'Nord-Kivu', dateIntegration: '2019-08-05', statut: 'en_permission', numeroCarteMillitaire: 'CM-2019-09876' },
  { id: 'M010', matricule: 'FARDC-2001-00056', nom: 'MATADI', postnom: 'BULA', prenom: 'Georges', dateNaissance: '1965-09-23', sexe: 'M', nationalite: 'Congolaise', provinceOrigine: 'Kongo-Central', adresse: 'Kinshasa', telephone: '+243800009900', groupeSanguin: 'AB+', aptitudePhysique: 'inapte', grade: 'Général de Corps d\'Armée', corps: 'État-Major', arme: 'État-Major', unite: 'EMG', provinceAffectation: 'Kinshasa', dateIntegration: '2001-06-01', statut: 'retraite', numeroCarteMillitaire: 'CM-2001-00056' },
  { id: 'M011', matricule: 'FARDC-2016-06123', nom: 'BANZA', postnom: 'MUKONKO', prenom: 'Sylvie', dateNaissance: '1990-01-17', sexe: 'F', nationalite: 'Congolaise', provinceOrigine: 'Haut-Katanga', adresse: 'Lubumbashi', telephone: '+243811002233', groupeSanguin: 'O+', aptitudePhysique: 'apte', grade: 'Sergent-Chef', corps: 'Infanterie', arme: 'Infanterie', unite: 'BTN-1012', provinceAffectation: 'Nord-Kivu', dateIntegration: '2016-03-12', statut: 'actif', numeroCarteMillitaire: 'CM-2016-06123' },
  { id: 'M012', matricule: 'FARDC-2014-05432', nom: 'NSIMBA', postnom: 'KIELE', prenom: 'Albert', dateNaissance: '1983-08-05', sexe: 'M', nationalite: 'Congolaise', provinceOrigine: 'Kongo-Central', adresse: 'Kinshasa', telephone: '+243822003344', groupeSanguin: 'B+', aptitudePhysique: 'apte', grade: 'Adjudant', corps: 'Logistique', arme: 'Logistique', unite: 'BASE-KIN', provinceAffectation: 'Kinshasa', dateIntegration: '2014-05-20', statut: 'actif', numeroCarteMillitaire: 'CM-2014-05432' },
]

export const missions: Mission[] = [
  { id: 'OP001', code: 'OP-NK-2025-047', nom: 'Opération Bouclier Kivutien', type: 'securisation', objectif: 'Sécurisation de l\'axe Goma-Rutshuru contre les groupes armés rebelles', zone: 'Axe Goma-Rutshuru, Nord-Kivu', responsable: 'Col MUTEBA', unitesPrincipales: ['BDE-101', 'BTN-1011'], effectifEngage: 850, dateDebut: '2025-06-01', statut: 'en_cours', province: 'Nord-Kivu', priorite: 'critique', pertesCombat: 3, blesses: 12, coordonnees: { lat: -1.5, lng: 29.35 } },
  { id: 'OP002', code: 'OP-SK-2025-031', nom: 'Opération Paix Kivu Sud', type: 'patrouille', objectif: 'Patrouilles de sécurisation dans la plaine de la Ruzizi', zone: 'Plaine de la Ruzizi, Sud-Kivu', responsable: 'Col LIKAMBO', unitesPrincipales: ['BDE-102'], effectifEngage: 420, dateDebut: '2025-05-15', statut: 'en_cours', province: 'Sud-Kivu', priorite: 'haute', blesses: 2, coordonnees: { lat: -2.7, lng: 28.9 } },
  { id: 'OP003', code: 'OP-IT-2025-018', nom: 'Mission Humanitaire Ituri', type: 'humanitaire', objectif: 'Protection et assistance aux déplacés internes dans la province de l\'Ituri', zone: 'Bunia et environs, Ituri', responsable: 'LtCol NZUZI', unitesPrincipales: ['RM-NORD'], effectifEngage: 250, dateDebut: '2025-04-20', dateFin: '2025-08-20', statut: 'en_cours', province: 'Ituri', priorite: 'haute', coordonnees: { lat: 1.55, lng: 30.25 } },
  { id: 'OP004', code: 'OP-KIN-2025-009', nom: 'Sécurisation Kinshasa Est', type: 'securisation', objectif: 'Renforcement de la sécurité dans les quartiers Est de Kinshasa', zone: 'Kinshasa Est', responsable: 'Cdt LUSAMBA', unitesPrincipales: ['BASE-KIN'], effectifEngage: 300, dateDebut: '2025-06-10', statut: 'en_cours', province: 'Kinshasa', priorite: 'normale', coordonnees: { lat: -4.3, lng: 15.4 } },
  { id: 'OP005', code: 'OP-KAT-2025-022', nom: 'Patrouille Frontière Katanga', type: 'patrouille', objectif: 'Surveillance de la frontière avec la Zambie au Katanga', zone: 'Frontière RDC-Zambie, Katanga', responsable: 'Gal Bde ILUNGA', unitesPrincipales: ['RM-SUD'], effectifEngage: 560, dateDebut: '2025-03-01', statut: 'en_cours', province: 'Katanga', priorite: 'haute', coordonnees: { lat: -11.5, lng: 28.6 } },
  { id: 'OP006', code: 'OP-MAN-2025-005', nom: 'Formation Maniema', type: 'formation', objectif: 'Formation tactique avancée pour les nouvelles recrues du Maniema', zone: 'Centre de formation, Kindu', responsable: 'Cpt MUTOMBO', unitesPrincipales: ['RM-33'], effectifEngage: 180, dateDebut: '2025-06-15', dateFin: '2025-09-15', statut: 'en_cours', province: 'Maniema', priorite: 'normale', coordonnees: { lat: -2.95, lng: 25.93 } },
  { id: 'OP007', code: 'OP-NK-2025-033', nom: 'Opération Masisi Libre', type: 'offensive', objectif: 'Neutralisation des bases rebelles dans le territoire de Masisi', zone: 'Territoire de Masisi, Nord-Kivu', responsable: 'LtCol KABONGO', unitesPrincipales: ['BTN-1012'], effectifEngage: 680, dateDebut: '2025-05-28', statut: 'en_cours', province: 'Nord-Kivu', priorite: 'critique', pertesCombat: 7, blesses: 23, coordonnees: { lat: -1.4, lng: 28.8 } },
  { id: 'OP008', code: 'OP-KAS-2024-087', nom: 'Sécurisation Kasaï', type: 'securisation', objectif: 'Pacification du territoire du Kasaï Central', zone: 'Kasaï Central', responsable: 'Col TSHIMANGA', unitesPrincipales: ['RM-21'], effectifEngage: 400, dateDebut: '2024-10-01', dateFin: '2025-04-30', statut: 'terminee', province: 'Kasaï Central', priorite: 'haute', pertesCombat: 2, blesses: 8 },
]

export const vehicules: Vehicule[] = [
  { id: 'V001', immatriculation: 'FARDC-BLD-001', marque: 'BTR', modele: 'BTR-80', type: 'blinde', annee: 2018, unite: 'BDE-101', statut: 'en_mission', kilometrage: 48500, derniereMaintenance: '2025-03-15', prochaineMaintenance: '2025-09-15', carburant: 78, conducteurActuel: 'Sgt NGOMA', coordonnees: { lat: -1.52, lng: 29.38 } },
  { id: 'V002', immatriculation: 'FARDC-CAM-012', marque: 'Ural', modele: '4320', type: 'camion', annee: 2015, unite: 'BTN-1011', statut: 'operationnel', kilometrage: 125000, derniereMaintenance: '2025-05-20', prochaineMaintenance: '2025-11-20', carburant: 55 },
  { id: 'V003', immatriculation: 'FARDC-LGR-045', marque: 'Toyota', modele: 'Land Cruiser', type: 'vehicule_leger', annee: 2021, unite: 'EMG', statut: 'operationnel', kilometrage: 32000, derniereMaintenance: '2025-06-01', prochaineMaintenance: '2025-12-01', carburant: 90, coordonnees: { lat: -4.32, lng: 15.32 } },
  { id: 'V004', immatriculation: 'FARDC-CMD-003', marque: 'Mercedes', modele: 'G-Class', type: 'commandement', annee: 2022, unite: 'EMG', statut: 'operationnel', kilometrage: 18500, derniereMaintenance: '2025-06-10', prochaineMaintenance: '2025-12-10', carburant: 85, conducteurActuel: 'SCh BANZA' },
  { id: 'V005', immatriculation: 'FARDC-BLD-008', marque: 'BRDM', modele: '2M', type: 'blinde', annee: 2010, unite: 'BDE-102', statut: 'maintenance', kilometrage: 87000, derniereMaintenance: '2025-06-15', prochaineMaintenance: '2025-07-15', carburant: 30 },
  { id: 'V006', immatriculation: 'FARDC-CAM-028', marque: 'GAZ', modele: '66', type: 'camion', annee: 2012, unite: 'BASE-KIN', statut: 'en_mission', kilometrage: 156000, derniereMaintenance: '2025-04-10', prochaineMaintenance: '2025-10-10', carburant: 45, coordonnees: { lat: -4.35, lng: 15.45 } },
  { id: 'V007', immatriculation: 'FARDC-MTR-067', marque: 'Honda', modele: 'XR150', type: 'moto', annee: 2023, unite: 'BTN-1012', statut: 'operationnel', kilometrage: 8500, derniereMaintenance: '2025-05-01', prochaineMaintenance: '2025-11-01', carburant: 72, coordonnees: { lat: -1.38, lng: 28.81 } },
  { id: 'V008', immatriculation: 'FARDC-BAT-002', marque: 'Zodiac', modele: 'Hurricane 940', type: 'bateau', annee: 2019, unite: 'RM-31', statut: 'operationnel', kilometrage: 12000, derniereMaintenance: '2025-02-20', prochaineMaintenance: '2025-08-20', carburant: 60 },
  { id: 'V009', immatriculation: 'FARDC-BLD-015', marque: 'T-55', modele: 'T-55AM', type: 'blinde', annee: 2008, unite: 'RM-SUD', statut: 'hs', kilometrage: 230000, derniereMaintenance: '2024-09-01', prochaineMaintenance: '2025-03-01', carburant: 0 },
  { id: 'V010', immatriculation: 'FARDC-LGR-089', marque: 'Isuzu', modele: 'D-Max', type: 'vehicule_leger', annee: 2020, unite: 'RM-31', statut: 'operationnel', kilometrage: 55000, derniereMaintenance: '2025-04-15', prochaineMaintenance: '2025-10-15', carburant: 65, coordonnees: { lat: 0.52, lng: 25.20 } },
]

export const equipements: Equipement[] = [
  // Armement léger
  { id: 'EQ001', numeroSerie: 'AK47-RDC-12456', designation: 'Fusil d\'assaut AK-47 (7,62mm)', categorie: 'armement', sousCategorie: 'Armement léger', statut: 'attribue', unite: 'BTN-1011', baseStockage: 'BASE-AV-RUTH', attribueA: 'Cpt MUTOMBO David', dateAcquisition: '2018-06-01', valeur: 450, etat: 'bon', classification: 'sensible', quantiteStock: 1 },
  { id: 'EQ002', numeroSerie: 'AK47-RDC-12490', designation: 'Fusil d\'assaut AK-47 (7,62mm)', categorie: 'armement', sousCategorie: 'Armement léger', statut: 'disponible', unite: 'BTN-1011', baseStockage: 'BASE-AV-RUTH', dateAcquisition: '2018-06-01', valeur: 450, etat: 'excellent', classification: 'sensible', quantiteStock: 48 },
  { id: 'EQ003', numeroSerie: 'M4A1-FARDC-0341', designation: 'Carabine M4A1 (5,56mm)', categorie: 'armement', sousCategorie: 'Armement léger', statut: 'attribue', unite: 'EMG', baseStockage: 'BASE-KIN-PRINCIPALE', attribueA: 'LtCol NZUZI Paul', dateAcquisition: '2022-04-10', valeur: 980, etat: 'excellent', classification: 'sensible', quantiteStock: 1 },
  { id: 'EQ004', numeroSerie: 'PKM-RDC-03421', designation: 'Mitrailleuse PKM (7,62mm)', categorie: 'armement', sousCategorie: 'Armement collectif', statut: 'disponible', unite: 'BDE-101', baseStockage: 'BASE-GOMA', dateAcquisition: '2019-03-15', valeur: 2800, etat: 'excellent', classification: 'sensible', quantiteStock: 12 },
  { id: 'EQ005', numeroSerie: 'RPG7-RDC-0678', designation: 'Lance-roquettes RPG-7', categorie: 'armement', sousCategorie: 'Armement antichar', statut: 'disponible', unite: 'BTN-1012', baseStockage: 'BASE-GOMA', dateAcquisition: '2016-04-20', valeur: 3200, etat: 'bon', classification: 'tres_sensible', quantiteStock: 8 },
  // Armement lourd
  { id: 'EQ006', numeroSerie: 'MORT-82-RDC-234', designation: 'Mortier 82mm LM-60', categorie: 'armement', sousCategorie: 'Armement lourd', statut: 'disponible', unite: 'BDE-101', baseStockage: 'BASE-GOMA', dateAcquisition: '2017-11-05', valeur: 15000, etat: 'bon', classification: 'tres_sensible', quantiteStock: 4 },
  { id: 'EQ007', numeroSerie: 'MORT-120-RDC-045', designation: 'Mortier 120mm lourd', categorie: 'armement', sousCategorie: 'Armement lourd', statut: 'maintenance', unite: 'RM-31', baseStockage: 'DEPOT-CENTRAL', dateAcquisition: '2015-09-20', valeur: 42000, etat: 'acceptable', classification: 'tres_sensible', quantiteStock: 2 },
  { id: 'EQ008', numeroSerie: 'HMG-DSHk-0112', designation: 'Mitrailleuse lourde DShK 12,7mm', categorie: 'armement', sousCategorie: 'Armement lourd', statut: 'attribue', unite: 'BDE-102', baseStockage: 'BASE-BUKU', attribueA: 'Bataillon d\'appui feu', dateAcquisition: '2014-06-15', valeur: 8500, etat: 'bon', classification: 'tres_sensible', quantiteStock: 6 },
  // Grenades
  { id: 'EQ009', numeroSerie: 'GRN-F1-2021-00891', designation: 'Grenade à fragmentation F1', categorie: 'grenade', sousCategorie: 'Grenade offensive', statut: 'disponible', unite: 'BASE-KIN-PRINCIPALE', baseStockage: 'DEPOT-CENTRAL', dateAcquisition: '2021-01-10', valeur: 85, etat: 'excellent', classification: 'tres_sensible', quantiteStock: 1240 },
  { id: 'EQ010', numeroSerie: 'GRN-FUMU-2021-0892', designation: 'Grenade fumigène AN-M8 (jaune)', categorie: 'grenade', sousCategorie: 'Grenade fumigène', statut: 'disponible', unite: 'BASE-KIN-PRINCIPALE', baseStockage: 'DEPOT-CENTRAL', dateAcquisition: '2021-01-10', valeur: 45, etat: 'excellent', classification: 'standard', quantiteStock: 480 },
  { id: 'EQ011', numeroSerie: 'GRN-THERM-2022-0120', designation: 'Grenade incendiaire AN-M14 TH3', categorie: 'grenade', sousCategorie: 'Grenade incendiaire', statut: 'disponible', unite: 'BASE-KIN-PRINCIPALE', baseStockage: 'DEPOT-CENTRAL', dateAcquisition: '2022-03-05', valeur: 95, etat: 'excellent', classification: 'tres_sensible', quantiteStock: 360 },
  { id: 'EQ012', numeroSerie: 'GRN-LACR-2023-0045', designation: 'Grenade lacrymogène CS-1', categorie: 'grenade', sousCategorie: 'Grenade lacrymogène', statut: 'en_transit', unite: 'RM-OUEST', baseStockage: 'BASE-KIN-PRINCIPALE', dateAcquisition: '2023-08-20', valeur: 32, etat: 'excellent', classification: 'standard', quantiteStock: 800 },
  // Drones
  { id: 'EQ013', numeroSerie: 'DRN-DJI-M300-001', designation: 'Drone ISR DJI Matrice 300 RTK', categorie: 'drone', sousCategorie: 'Drone de reconnaissance', statut: 'attribue', unite: 'BDE-101', baseStockage: 'BASE-GOMA', dateAcquisition: '2023-04-15', valeur: 48500, etat: 'excellent', classification: 'tres_sensible', quantiteStock: 1 },
  { id: 'EQ014', numeroSerie: 'DRN-DJI-M300-002', designation: 'Drone ISR DJI Matrice 300 RTK', categorie: 'drone', sousCategorie: 'Drone de reconnaissance', statut: 'maintenance', unite: 'BDE-101', baseStockage: 'BASE-GOMA', dateAcquisition: '2023-04-15', valeur: 48500, etat: 'acceptable', classification: 'tres_sensible', quantiteStock: 1 },
  { id: 'EQ015', numeroSerie: 'DRN-DJI-M300-003', designation: 'Drone ISR DJI Matrice 300 RTK', categorie: 'drone', sousCategorie: 'Drone de reconnaissance', statut: 'disponible', unite: 'RM-31', baseStockage: 'DEPOT-CENTRAL', dateAcquisition: '2024-01-10', valeur: 48500, etat: 'excellent', classification: 'tres_sensible', quantiteStock: 1 },
  { id: 'EQ016', numeroSerie: 'DRN-BAY-TB2-001', designation: 'Drone tactique Bayraktar TB2', categorie: 'drone', sousCategorie: 'Drone tactique MALE', statut: 'disponible', unite: 'RM-34', baseStockage: 'BASE-GOMA', dateAcquisition: '2024-02-28', valeur: 185000, etat: 'excellent', classification: 'tres_sensible', quantiteStock: 1 },
  { id: 'EQ017', numeroSerie: 'DRN-OR2-001', designation: 'Drone tactique Orion-2 (ISR/STRIKE)', categorie: 'drone', sousCategorie: 'Drone tactique MALE', statut: 'maintenance', unite: 'EMG', baseStockage: 'DEPOT-CENTRAL', dateAcquisition: '2024-06-01', valeur: 220000, etat: 'acceptable', classification: 'tres_sensible', quantiteStock: 1 },
  // Munitions
  { id: 'EQ018', numeroSerie: 'MUN-762-2024-STOCK', designation: 'Cartouches 7,62×39mm (AK)', categorie: 'munitions', sousCategorie: 'Munitions armes légères', statut: 'disponible', unite: 'BTN-1011', baseStockage: 'BASE-AV-RUTH', dateAcquisition: '2024-11-10', valeur: 0.35, etat: 'excellent', classification: 'sensible', quantiteStock: 15000 },
  { id: 'EQ019', numeroSerie: 'MUN-556-2024-STOCK', designation: 'Cartouches 5,56×45mm NATO', categorie: 'munitions', sousCategorie: 'Munitions armes légères', statut: 'disponible', unite: 'EMG', baseStockage: 'BASE-KIN-PRINCIPALE', dateAcquisition: '2024-09-05', valeur: 0.65, etat: 'excellent', classification: 'sensible', quantiteStock: 42000 },
  { id: 'EQ020', numeroSerie: 'MUN-127-2023-STOCK', designation: 'Cartouches 12,7mm DShK', categorie: 'munitions', sousCategorie: 'Munitions armes lourdes', statut: 'disponible', unite: 'BDE-102', baseStockage: 'BASE-BUKU', dateAcquisition: '2023-12-15', valeur: 2.80, etat: 'bon', classification: 'tres_sensible', quantiteStock: 8000 },
  { id: 'EQ021', numeroSerie: 'MUN-RPG-ROQUETTE', designation: 'Roquette PG-7VL pour RPG-7', categorie: 'munitions', sousCategorie: 'Roquettes et obus', statut: 'disponible', unite: 'BTN-1012', baseStockage: 'BASE-GOMA', dateAcquisition: '2023-07-20', valeur: 125, etat: 'excellent', classification: 'tres_sensible', quantiteStock: 240 },
  // Communication
  { id: 'EQ022', numeroSerie: 'RAD-HARRIS-7821', designation: 'Radio Harris AN/PRC-117G', categorie: 'communication', sousCategorie: 'Radio tactique HF/VHF', statut: 'attribue', unite: 'BTN-1012', baseStockage: 'BASE-GOMA', attribueA: 'Sgt NGOMA Christophe', dateAcquisition: '2021-08-20', valeur: 12500, etat: 'bon', classification: 'tres_sensible', quantiteStock: 1 },
  { id: 'EQ023', numeroSerie: 'SAT-IRIDIUM-0034', designation: 'Terminal satellite Iridium 9575', categorie: 'communication', sousCategorie: 'Communication satellite', statut: 'attribue', unite: 'EMG', baseStockage: 'BASE-KIN-PRINCIPALE', attribueA: 'Cdt TSHILOMBO', dateAcquisition: '2022-11-01', valeur: 3800, etat: 'excellent', classification: 'tres_sensible', quantiteStock: 1 },
  // Protection
  { id: 'EQ024', numeroSerie: 'GV-ITAL-5634', designation: 'Gilet pare-balles Niveau IV', categorie: 'protection', sousCategorie: 'Protection balistique', statut: 'attribue', unite: 'BTN-1011', baseStockage: 'BASE-AV-RUTH', attribueA: 'Cpt MUTOMBO David', dateAcquisition: '2022-01-10', valeur: 1800, etat: 'bon', classification: 'standard', quantiteStock: 1 },
  { id: 'EQ025', numeroSerie: 'CASQUE-BAL-3341', designation: 'Casque balistique MICH 2001', categorie: 'protection', sousCategorie: 'Protection balistique', statut: 'hors_service', unite: 'BDE-102', baseStockage: 'BASE-BUKU', dateAcquisition: '2015-07-12', valeur: 420, etat: 'mauvais', classification: 'standard', quantiteStock: 1 },
]

export const permissions: Permission[] = [
  { id: 'P001', militaireId: 'M009', militaireNom: 'MWANGU Joséphine', matricule: 'FARDC-2019-09876', grade: 'Sous-Lieutenant', unite: 'BDE-101', type: 'conge_annuel', dateDebut: '2025-06-20', dateFin: '2025-07-04', motif: 'Congé annuel réglementaire', statut: 'approuve', validePar: 'Col MUTEBA', dateValidation: '2025-06-15', commentaire: 'Approuvé. Retour au service le 05 juillet.' },
  { id: 'P002', militaireId: 'M004', militaireNom: 'NGOMA Christophe', matricule: 'FARDC-2020-11456', grade: 'Sergent', unite: 'BTN-1011', type: 'conge_maladie', dateDebut: '2025-06-18', dateFin: '2025-07-10', motif: 'Blessure de combat — fracture tibia gauche', statut: 'en_cours', validePar: 'LtCol NZUZI', dateValidation: '2025-06-18' },
  { id: 'P003', militaireId: 'M007', militaireNom: 'BOLAMBA Théodore', matricule: 'FARDC-2022-15678', grade: 'Soldat', unite: 'RM-NORD', type: 'permission_exceptionnelle', dateDebut: '2025-06-25', dateFin: '2025-06-28', motif: 'Décès du père', statut: 'en_attente', commentaire: 'En attente de validation du commandant d\'unité' },
  { id: 'P004', militaireId: 'M011', militaireNom: 'BANZA Sylvie', matricule: 'FARDC-2016-06123', grade: 'Sergent-Chef', unite: 'BTN-1012', type: 'conge_annuel', dateDebut: '2025-07-01', dateFin: '2025-07-21', motif: 'Congé annuel réglementaire', statut: 'en_attente' },
  { id: 'P005', militaireId: 'M002', militaireNom: 'LOKONDA Marie-Claire', matricule: 'FARDC-2018-07834', grade: 'Lieutenant', unite: 'BDE-101', type: 'repos_compensateur', dateDebut: '2025-06-27', dateFin: '2025-06-29', motif: 'Compensation heures supplémentaires — opération BOUCLIER', statut: 'approuve', validePar: 'Col MUTEBA', dateValidation: '2025-06-22' },
]

export const presences: Presence[] = [
  { id: 'PR001', militaireId: 'M001', militaireNom: 'MUTOMBO David', matricule: 'FARDC-2015-04521', grade: 'Capitaine', unite: 'BTN-1011', date: '2025-06-23', arrivee: '06:45', depart: undefined, statut: 'mission', methode: 'gps', observation: 'En mission OP-NK-2025-047' },
  { id: 'PR002', militaireId: 'M002', militaireNom: 'LOKONDA Marie-Claire', matricule: 'FARDC-2018-07834', grade: 'Lieutenant', unite: 'BDE-101', date: '2025-06-23', arrivee: '07:30', statut: 'present', methode: 'biometrique' },
  { id: 'PR003', militaireId: 'M003', militaireNom: 'KABILA Patrick', matricule: 'FARDC-2010-01293', grade: 'Lieutenant-Colonel', unite: 'BDE-102', date: '2025-06-23', arrivee: '07:15', statut: 'present', methode: 'biometrique' },
  { id: 'PR004', militaireId: 'M004', militaireNom: 'NGOMA Christophe', matricule: 'FARDC-2020-11456', grade: 'Sergent', unite: 'BTN-1011', date: '2025-06-23', statut: 'conge_maladie', methode: 'manuel', observation: 'Congé médical — fracture tibia' },
  { id: 'PR005', militaireId: 'M005', militaireNom: 'TSHILOMBO Bernadette', matricule: 'FARDC-2012-03678', grade: 'Commandant', unite: 'RM-OUEST', date: '2025-06-23', arrivee: '08:05', statut: 'retard', methode: 'biometrique', observation: 'Retard de 35 minutes' },
  { id: 'PR006', militaireId: 'M009', militaireNom: 'MWANGU Joséphine', matricule: 'FARDC-2019-09876', grade: 'Sous-Lieutenant', unite: 'BDE-101', date: '2025-06-23', statut: 'permission', methode: 'manuel', observation: 'Congé annuel approuvé' },
]

export const dossiersMedicaux: DossierMedical[] = [
  { id: 'MED001', militaireId: 'M001', militaireNom: 'MUTOMBO David', matricule: 'FARDC-2015-04521', groupeSanguin: 'O+', allergies: ['Pénicilline'], vaccinations: [{ nom: 'Fièvre jaune', date: '2024-01-15', prochainRappel: '2034-01-15', statut: 'a_jour' }, { nom: 'COVID-19', date: '2023-10-20', statut: 'a_jour' }, { nom: 'Typhoïde', date: '2022-05-10', prochainRappel: '2025-05-10', statut: 'en_retard' }], aptitudePhysique: 'apte', dateEvaluation: '2025-01-20', antecedents: 'Malaria 2019, guérison complète', blessures: [], statut: 'actif' },
  { id: 'MED004', militaireId: 'M004', militaireNom: 'NGOMA Christophe', matricule: 'FARDC-2020-11456', groupeSanguin: 'AB-', allergies: [], vaccinations: [{ nom: 'Fièvre jaune', date: '2023-09-01', prochainRappel: '2033-09-01', statut: 'a_jour' }], aptitudePhysique: 'apte_restriction', dateEvaluation: '2025-06-18', antecedents: 'Aucun', blessures: [{ date: '2025-06-15', description: 'Fracture du tibia gauche suite à chute en opération', type: 'combat', sequelles: 'Convalescence 3 semaines' }], statut: 'convalescence' },
]

export const dossiersDisciplinaires: DossierDisciplinaire[] = [
  { id: 'DIS001', militaireId: 'M005', militaireNom: 'TSHILOMBO Bernadette', matricule: 'FARDC-2012-03678', grade: 'Commandant', unite: 'RM-OUEST', type: 'sanction', categorie: 'Manquement à la discipline', description: 'Retards répétés (3 fois en un mois) sans justification valide', date: '2025-06-05', statut: 'clos', sanction: 'Blâme avec inscription au dossier', decidePar: 'Gal D. MWAMBA', dateDecision: '2025-06-12' },
  { id: 'DIS002', militaireId: 'M001', militaireNom: 'MUTOMBO David', matricule: 'FARDC-2015-04521', grade: 'Capitaine', unite: 'BTN-1011', type: 'distinction', categorie: 'Bravoure au combat', description: 'Acte héroïque lors de l\'Opération Bouclier Kivutien — a sauvé 4 camarades sous le feu ennemi', date: '2025-06-20', statut: 'clos', sanction: 'Médaille de bravoure militaire + Citation à l\'ordre de la brigade', decidePar: 'Gal D. KAZADI', dateDecision: '2025-06-21' },
  { id: 'DIS003', militaireId: 'M007', militaireNom: 'BOLAMBA Théodore', matricule: 'FARDC-2022-15678', grade: 'Soldat', unite: 'RM-NORD', type: 'infraction', categorie: 'Absence sans autorisation', description: 'Absence injustifiée de 3 jours du 10 au 12 juin 2025', date: '2025-06-13', statut: 'en_cours', decidePar: undefined },
]

export const fichesFinancieres: FicheFinanciere[] = [
  { id: 'FIN001', militaireId: 'M001', militaireNom: 'MUTOMBO David', matricule: 'FARDC-2015-04521', grade: 'Capitaine', unite: 'BTN-1011', mois: 'Juin', annee: 2025, salaireBase: 780, primeMission: 250, primeRisque: 150, primeAnciennete: 78, primeSpecialite: 0, deductions: 95, netAPayer: 1163, statut: 'calcule', modePaiement: 'virement' },
  { id: 'FIN002', militaireId: 'M002', militaireNom: 'LOKONDA Marie-Claire', matricule: 'FARDC-2018-07834', grade: 'Lieutenant', unite: 'BDE-101', mois: 'Juin', annee: 2025, salaireBase: 650, primeMission: 150, primeRisque: 100, primeAnciennete: 39, primeSpecialite: 120, deductions: 78, netAPayer: 981, statut: 'valide', dateVirement: '2025-06-30', modePaiement: 'virement' },
  { id: 'FIN003', militaireId: 'M003', militaireNom: 'KABILA Patrick', matricule: 'FARDC-2010-01293', grade: 'Lieutenant-Colonel', unite: 'BDE-102', mois: 'Juin', annee: 2025, salaireBase: 1100, primeMission: 0, primeRisque: 150, primeAnciennete: 165, primeSpecialite: 80, deductions: 145, netAPayer: 1350, statut: 'paye', dateVirement: '2025-06-25', modePaiement: 'virement' },
  { id: 'FIN004', militaireId: 'M004', militaireNom: 'NGOMA Christophe', matricule: 'FARDC-2020-11456', grade: 'Sergent', unite: 'BTN-1011', mois: 'Juin', annee: 2025, salaireBase: 320, primeMission: 0, primeRisque: 50, primeAnciennete: 16, primeSpecialite: 0, deductions: 40, netAPayer: 346, statut: 'calcule', modePaiement: 'mobile_money' },
  { id: 'FIN005', militaireId: 'M005', militaireNom: 'TSHILOMBO Bernadette', matricule: 'FARDC-2012-03678', grade: 'Commandant', unite: 'RM-OUEST', mois: 'Juin', annee: 2025, salaireBase: 950, primeMission: 0, primeRisque: 80, primeAnciennete: 114, primeSpecialite: 150, deductions: 128, netAPayer: 1166, statut: 'litige', modePaiement: 'virement' },
]

export const messages: Message[] = [
  { id: 'MSG001', expediteurId: 'USR-002', expediteurNom: 'Col MUTEBA', expediteurGrade: 'Colonel', destinataireId: 'USR-001', destinataireNom: 'Gal Bde KABILA', contenu: 'Rapport situation OP BOUCLIER KIVUTIEN — Journée du 23 juin. L\'axe Goma-Rutshuru est sécurisé sur 45km. Accrochage à 14h30 neutralisé. 0 pertes côté FARDC.', dateEnvoi: '2025-06-23T18:30:00Z', lu: false, priorite: 'haute', chiffre: true },
  { id: 'MSG002', expediteurId: 'USR-003', expediteurNom: 'LtCol NZUZI', expediteurGrade: 'Lieutenant-Colonel', destinataireId: 'USR-001', destinataireNom: 'Gal Bde KABILA', contenu: 'Demande de renforts en munitions calibre 7,62mm. Stock actuel : 15% capacité. Opérations continues nécessitent ravitaillement urgent.', dateEnvoi: '2025-06-23T16:15:00Z', lu: false, priorite: 'critique', chiffre: true },
  { id: 'MSG003', expediteurId: 'USR-001', expediteurNom: 'Gal Bde KABILA', expediteurGrade: 'Général de Brigade', groupeId: 'GRP-001', groupeNom: 'Commandants Région Est', contenu: 'Réunion de coordination opérationnelle demain 24/06 à 09h00. Présence obligatoire de tous les commandants de brigade. Ordre du jour joint.', dateEnvoi: '2025-06-23T14:00:00Z', lu: true, priorite: 'normale', chiffre: false },
  { id: 'MSG004', expediteurId: 'USR-004', expediteurNom: 'Cpt MUTOMBO', expediteurGrade: 'Capitaine', destinataireId: 'USR-003', destinataireNom: 'LtCol NZUZI', contenu: 'CP1 a pris contact à 16h42. Point de passage sécurisé. Poursuite de la progression vers l\'objectif secondaire. ETA au point BRAVO : 19h30.', dateEnvoi: '2025-06-23T17:00:00Z', lu: true, priorite: 'urgente', chiffre: true },
  { id: 'MSG005', expediteurId: 'USR-005', expediteurNom: 'Admin Système', expediteurGrade: 'Administrateur', destinataireId: 'USR-001', destinataireNom: 'Gal Bde KABILA', contenu: 'Maintenance planifiée du système MILSYS RDC le dimanche 29 juin de 02h00 à 06h00. Certains services seront momentanément indisponibles.', dateEnvoi: '2025-06-23T09:00:00Z', lu: true, priorite: 'normale', chiffre: false },
]

export const documents: Document[] = [
  { id: 'DOC001', titre: 'Directive opérationnelle — Opération Bouclier Kivutien', type: 'directive', classification: 'secret', auteur: 'Gal D. KAZADI', unite: 'RM-EST', dateCreation: '2025-05-28', dateModification: '2025-06-01', version: '2.1', statut: 'valide', taille: '2.4 MB', telechargements: 12, signatureElectronique: true },
  { id: 'DOC002', titre: 'Rapport mensuel d\'activité — Mai 2025 — BDE-101', type: 'rapport', classification: 'confidentiel', auteur: 'Col MUTEBA', unite: 'BDE-101', dateCreation: '2025-06-05', dateModification: '2025-06-06', version: '1.0', statut: 'valide', taille: '5.8 MB', telechargements: 8, signatureElectronique: true },
  { id: 'DOC003', titre: 'Procédure de sécurité informatique MILSYS', type: 'procedure', classification: 'restreint', auteur: 'DSI Défense', unite: 'EMG', dateCreation: '2025-01-10', dateModification: '2025-06-15', version: '3.0', statut: 'valide', taille: '1.2 MB', telechargements: 45, signatureElectronique: true },
  { id: 'DOC004', titre: 'Note de service — Règlement sur les permissions 2025', type: 'note', classification: 'restreint', auteur: 'Gal Bde KABILA', unite: 'EMG', dateCreation: '2025-04-20', dateModification: '2025-04-20', version: '1.0', statut: 'valide', taille: '0.8 MB', telechargements: 134, signatureElectronique: false },
  { id: 'DOC005', titre: 'Formulaire de demande de permission', type: 'formulaire', classification: 'public', auteur: 'Admin RH', unite: 'EMG', dateCreation: '2024-01-01', dateModification: '2025-01-01', version: '5.0', statut: 'valide', taille: '0.3 MB', telechargements: 1256, signatureElectronique: false },
  { id: 'DOC006', titre: 'Plan de formation annuel 2025 — FARDC', type: 'directive', classification: 'restreint', auteur: 'Direction de la Formation', unite: 'EMG', dateCreation: '2025-01-15', dateModification: '2025-02-10', version: '1.2', statut: 'valide', taille: '3.1 MB', telechargements: 67, signatureElectronique: true },
]

export const auditLogs: AuditLog[] = [
  { id: 'AUD001', utilisateurId: 'USR-001', utilisateurNom: 'KABILA Jean-Pierre', utilisateurGrade: 'Gal Bde', action: 'connexion', module: 'Authentification', description: 'Connexion réussie avec MFA', timestamp: '2025-06-23T07:42:00Z', adresseIp: '192.168.10.1', appareil: 'PC-BUREAU-01', province: 'Kinshasa', statut: 'succes' },
  { id: 'AUD002', utilisateurId: 'USR-002', utilisateurNom: 'MUTEBA Alphonse', utilisateurGrade: 'Col', action: 'creation', module: 'Opérations', description: 'Création du rapport de situation OP-NK-2025-047', objetConcerne: 'OP-NK-2025-047', timestamp: '2025-06-23T18:28:00Z', adresseIp: '10.45.12.8', appareil: 'LAPTOP-BDE-101', province: 'Nord-Kivu', statut: 'succes' },
  { id: 'AUD003', utilisateurId: 'USR-006', utilisateurNom: 'ANONYME', utilisateurGrade: 'Inconnu', action: 'connexion', module: 'Authentification', description: 'Tentative de connexion échouée (5 tentatives)', timestamp: '2025-06-23T03:15:00Z', adresseIp: '41.243.12.54', appareil: 'INCONNU', province: 'Inconnu', statut: 'suspect' },
  { id: 'AUD004', utilisateurId: 'USR-003', utilisateurNom: 'NZUZI Paul', utilisateurGrade: 'LtCol', action: 'modification', module: 'Personnel', description: 'Mise à jour du statut militaire FARDC-2020-11456', objetConcerne: 'FARDC-2020-11456', ancienneValeur: 'en_mission', nouvelleValeur: 'blesse', timestamp: '2025-06-23T16:45:00Z', adresseIp: '10.45.14.22', appareil: 'TABLET-BTN-1011', province: 'Nord-Kivu', statut: 'succes' },
  { id: 'AUD005', utilisateurId: 'USR-007', utilisateurNom: 'BANZA Sylvie', utilisateurGrade: 'SCh', action: 'export', module: 'Rapports', description: 'Export PDF liste de présence BTN-1012 du 23/06/2025', timestamp: '2025-06-23T12:00:00Z', adresseIp: '10.45.16.5', appareil: 'PC-BTN-1012-01', province: 'Nord-Kivu', statut: 'succes' },
  { id: 'AUD006', utilisateurId: 'USR-001', utilisateurNom: 'KABILA Jean-Pierre', utilisateurGrade: 'Gal Bde', action: 'consultation', module: 'Personnel', description: 'Consultation dossier médical FARDC-2020-11456', objetConcerne: 'FARDC-2020-11456', timestamp: '2025-06-23T10:30:00Z', adresseIp: '192.168.10.1', appareil: 'PC-BUREAU-01', province: 'Kinshasa', statut: 'succes' },
]

export const alertes: Alerte[] = [
  { id: 'ALT001', titre: 'Contact ennemi — Axe Rutshuru', description: '3 éléments du BTN-1011 rapportent un accrochage sur l\'axe Rutshuru-Kiwanja à 16h32. Situation sous contrôle. Renforts demandés.', niveau: 'critique', module: 'Opérations', province: 'Nord-Kivu', unite: 'BTN-1011', dateCreation: '2025-06-23T16:32:00Z', statut: 'non_lue', destinataires: ['admin_national', 'admin_provincial'], source: 'Terrain / Radio BTN-1011' },
  { id: 'ALT002', titre: 'Stock munitions critique — BTN-1011', description: 'Le stock de munitions 7,62mm du BTN-1011 est à 15% de la capacité nominale. Ravitaillement urgent nécessaire dans les 48h.', niveau: 'haute', module: 'Équipements', province: 'Nord-Kivu', unite: 'BTN-1011', dateCreation: '2025-06-23T14:00:00Z', statut: 'lue', destinataires: ['admin_national', 'admin_provincial'], source: 'Système automatique — Logistique' },
  { id: 'ALT003', titre: 'Tentative d\'intrusion système détectée', description: '5 tentatives de connexion échouées depuis l\'IP 41.243.12.54 à 03h15. Adresse IP bloquée automatiquement. Enquête en cours.', niveau: 'critique', module: 'Sécurité', dateCreation: '2025-06-23T03:20:00Z', statut: 'non_lue', destinataires: ['super_admin', 'admin_national'], source: 'Système de détection d\'intrusion (IDS)' },
  { id: 'ALT004', titre: 'Véhicule FARDC-BLD-009 hors de zone autorisée', description: 'Le véhicule blindé FARDC-BLD-009 (T-55AM) a franchi le périmètre autorisé à 11h45. Dernière position : coordonnées -11.8, 27.9.', niveau: 'haute', module: 'Géolocalisation', province: 'Katanga', dateCreation: '2025-06-23T11:45:00Z', statut: 'traitee', destinataires: ['admin_provincial'], source: 'Géofencing automatique' },
  { id: 'ALT005', titre: 'Vaccination Typhoïde expirée — 47 militaires', description: 'Le rappel vaccinal Typhoïde de 47 militaires de la RM-EST est dépassé de plus de 30 jours. Action médicale requise.', niveau: 'moyenne', module: 'Médical', province: 'Nord-Kivu', dateCreation: '2025-06-22T08:00:00Z', statut: 'lue', destinataires: ['admin_provincial'], source: 'Système automatique — Module Médical' },
  { id: 'ALT006', titre: 'Maintenance préventive — 8 véhicules BTN-1012', description: '8 véhicules du BTN-1012 ont dépassé le kilométrage de maintenance préventive. Risque de panne en opérations.', niveau: 'moyenne', module: 'Véhicules', province: 'Nord-Kivu', unite: 'BTN-1012', dateCreation: '2025-06-21T10:00:00Z', statut: 'lue', destinataires: ['admin_sectoriel'], source: 'Système automatique — Flotte' },
]

export const statsNationales = {
  effectifTotal: 134872,
  effectifActifs: 98450,
  effectifEnMission: 24680,
  effectifEnFormation: 3240,
  effectifEnPermission: 4180,
  effectifBlesses: 892,
  effectifRetraites: 3430,
  missionsActives: 7,
  vehiculesOperationnels: 2847,
  vehiculesMaintenance: 342,
  alertesCritiques: 3,
  equipementsDisponibles: 45230,
}

export const effectifsParProvince = [
  { province: 'Kinshasa', effectif: 18450 },
  { province: 'Nord-Kivu', effectif: 22340 },
  { province: 'Sud-Kivu', effectif: 15670 },
  { province: 'Katanga', effectif: 14890 },
  { province: 'Orientale', effectif: 12560 },
  { province: 'Kasaï', effectif: 8920 },
  { province: 'Équateur', effectif: 7840 },
  { province: 'Maniema', effectif: 5430 },
  { province: 'Autres', effectif: 28772 },
]

export const missionsParMois = [
  { mois: 'Jan', missions: 12, terminées: 10 },
  { mois: 'Fév', missions: 15, terminées: 13 },
  { mois: 'Mar', missions: 18, terminées: 14 },
  { mois: 'Avr', missions: 22, terminées: 16 },
  { mois: 'Mai', missions: 19, terminées: 17 },
  { mois: 'Jun', missions: 24, terminées: 7 },
]

export const basesMilitaires: BaseMilitaire[] = [
  {
    id: 'BASE-KIN-PRINCIPALE', code: 'BASE-KIN-01', nom: 'Base Principale de Kinshasa — Camp Kokolo',
    type: 'base_principale', province: 'Kinshasa', localisation: 'Camp Kokolo, Kinshasa',
    commandant: 'Gal D. MWAMBA', effectifGarnison: 4850, capaciteMax: 6000,
    niveauSecurite: 'securisee', coordonnees: { lat: -4.32, lng: 15.32 },
    stocksMateriel: { armementLeger: 3240, armementLourd: 48, munitions: 180000, drones: 3, vehicules: 142, grenades: 2400 },
    certificationEnvoi: true, statut: 'operationnelle', derniereInspection: '2025-06-01'
  },
  {
    id: 'DEPOT-CENTRAL', code: 'DEPOT-CTR-01', nom: 'Dépôt Logistique Central FARDC',
    type: 'depot_logistique', province: 'Kinshasa', localisation: 'Zone Industrielle Limete, Kinshasa',
    commandant: 'Adj NSIMBA Albert', effectifGarnison: 380, capaciteMax: 500,
    niveauSecurite: 'securisee', coordonnees: { lat: -4.38, lng: 15.48 },
    stocksMateriel: { armementLeger: 8500, armementLourd: 120, munitions: 950000, drones: 5, vehicules: 78, grenades: 12000 },
    certificationEnvoi: true, statut: 'operationnelle', derniereInspection: '2025-06-15'
  },
  {
    id: 'BASE-GOMA', code: 'BASE-EST-01', nom: 'Base Militaire de Goma — Région Est',
    type: 'base_principale', province: 'Nord-Kivu', localisation: 'Goma, Nord-Kivu',
    commandant: 'Col MUTEBA Alphonse', effectifGarnison: 3240, capaciteMax: 4000,
    niveauSecurite: 'sous_surveillance', coordonnees: { lat: -1.67, lng: 29.22 },
    stocksMateriel: { armementLeger: 2180, armementLourd: 32, munitions: 75000, drones: 4, vehicules: 98, grenades: 1800 },
    certificationEnvoi: true, statut: 'operationnelle', derniereInspection: '2025-05-20'
  },
  {
    id: 'BASE-BUKU', code: 'BASE-SK-01', nom: 'Base Militaire de Bukavu — Sud-Kivu',
    type: 'base_avancee', province: 'Sud-Kivu', localisation: 'Bukavu, Sud-Kivu',
    commandant: 'Col LIKAMBO', effectifGarnison: 2100, capaciteMax: 3000,
    niveauSecurite: 'sous_surveillance', coordonnees: { lat: -2.49, lng: 28.85 },
    stocksMateriel: { armementLeger: 1450, armementLourd: 18, munitions: 48000, drones: 2, vehicules: 62, grenades: 960 },
    certificationEnvoi: true, statut: 'operationnelle', derniereInspection: '2025-05-10'
  },
  {
    id: 'BASE-LUBA', code: 'BASE-KAT-01', nom: 'Base Principale de Lubumbashi — Katanga',
    type: 'base_principale', province: 'Katanga', localisation: 'Lubumbashi, Katanga',
    commandant: 'Gal Bde ILUNGA', effectifGarnison: 3680, capaciteMax: 5000,
    niveauSecurite: 'securisee', coordonnees: { lat: -11.66, lng: 27.47 },
    stocksMateriel: { armementLeger: 2640, armementLourd: 56, munitions: 120000, drones: 3, vehicules: 115, grenades: 3200 },
    certificationEnvoi: true, statut: 'operationnelle', derniereInspection: '2025-06-10'
  },
  {
    id: 'BASE-KIS', code: 'BASE-OR-01', nom: 'Base Militaire de Kisangani — Orientale',
    type: 'base_principale', province: 'Orientale', localisation: 'Kisangani, Orientale',
    commandant: 'Gal Bde BOSENGE', effectifGarnison: 2940, capaciteMax: 4000,
    niveauSecurite: 'securisee', coordonnees: { lat: 0.51, lng: 25.19 },
    stocksMateriel: { armementLeger: 1980, armementLourd: 24, munitions: 88000, drones: 2, vehicules: 87, grenades: 1400 },
    certificationEnvoi: true, statut: 'operationnelle', derniereInspection: '2025-04-28'
  },
  {
    id: 'BASE-AV-RUTH', code: 'BASE-AV-NK-01', nom: 'Base Avancée de Rutshuru — NK',
    type: 'base_avancee', province: 'Nord-Kivu', localisation: 'Rutshuru, Nord-Kivu',
    commandant: 'LtCol NZUZI Paul', effectifGarnison: 654, capaciteMax: 800,
    niveauSecurite: 'compromise', coordonnees: { lat: -1.17, lng: 29.45 },
    stocksMateriel: { armementLeger: 380, armementLourd: 6, munitions: 8500, drones: 1, vehicules: 18, grenades: 240 },
    certificationEnvoi: false, statut: 'degradee', derniereInspection: '2025-06-18'
  },
  {
    id: 'POSTE-MASISI', code: 'POSTE-NK-02', nom: 'Poste d\'Observation Masisi — NK',
    type: 'poste_observation', province: 'Nord-Kivu', localisation: 'Masisi, Nord-Kivu',
    commandant: 'LtCol KABONGO', effectifGarnison: 420, capaciteMax: 600,
    niveauSecurite: 'compromise', coordonnees: { lat: -1.37, lng: 28.82 },
    stocksMateriel: { armementLeger: 280, armementLourd: 4, munitions: 6200, drones: 1, vehicules: 12, grenades: 180 },
    certificationEnvoi: false, statut: 'degradee', derniereInspection: '2025-06-20'
  },
]

export const centresFormation: CentreFormation[] = [
  {
    id: 'CF-001', code: 'CRAFSEM', nom: 'Centre de Recyclage et de Formation des Spécialistes de l\'EMG',
    province: 'Kinshasa', localisation: 'Camp Kokolo, Kinshasa', directeur: 'Gal D. LUSAMBA',
    capaciteAccueil: 800, stagiairesActuels: 642,
    specialites: ['Commandement', 'Renseignement', 'Transmissions', 'Logistique'],
    formations: [
      { id: 'F01', intitule: 'Cours de commandement d\'unité', dureeJours: 90, nbParticipants: 120, dateDebut: '2025-04-01', dateFin: '2025-06-30', statut: 'en_cours' },
      { id: 'F02', intitule: 'Formation officiers de renseignement', dureeJours: 60, nbParticipants: 45, dateDebut: '2025-05-15', dateFin: '2025-07-15', statut: 'en_cours' },
      { id: 'F03', intitule: 'Cours logistique opérationnelle', dureeJours: 45, nbParticipants: 80, dateDebut: '2025-07-01', dateFin: '2025-08-15', statut: 'planifiee' },
    ],
    niveauSecurite: 'securisee', coordonnees: { lat: -4.30, lng: 15.30 }, statut: 'actif'
  },
  {
    id: 'CF-002', code: 'ESM', nom: 'École Supérieure Militaire — État-Major',
    province: 'Kinshasa', localisation: 'Binza, Kinshasa', directeur: 'Gal CA MATADI Georges',
    capaciteAccueil: 400, stagiairesActuels: 312,
    specialites: ['Stratégie', 'Droit international humanitaire', 'Géopolitique', 'État-major'],
    formations: [
      { id: 'F04', intitule: 'Cours supérieur de guerre', dureeJours: 365, nbParticipants: 48, dateDebut: '2025-01-15', dateFin: '2026-01-14', statut: 'en_cours' },
      { id: 'F05', intitule: 'Séminaire droit humanitaire international', dureeJours: 10, nbParticipants: 62, dateDebut: '2025-07-07', dateFin: '2025-07-17', statut: 'planifiee' },
    ],
    niveauSecurite: 'securisee', coordonnees: { lat: -4.28, lng: 15.28 }, statut: 'actif'
  },
  {
    id: 'CF-003', code: 'CFO-EST', nom: 'Centre de Formation Opérationnelle — Est',
    province: 'Nord-Kivu', localisation: 'Goma, Nord-Kivu', directeur: 'LtCol MWANGU',
    capaciteAccueil: 600, stagiairesActuels: 485,
    specialites: ['Combat en zone forestière', 'Contre-insurrection', 'Drones tactiques', 'Premiers secours au combat'],
    formations: [
      { id: 'F06', intitule: 'Formation combat contre-insurrection', dureeJours: 60, nbParticipants: 180, dateDebut: '2025-05-01', dateFin: '2025-06-30', statut: 'en_cours' },
      { id: 'F07', intitule: 'Opérateurs drones tactiques', dureeJours: 30, nbParticipants: 24, dateDebut: '2025-06-15', dateFin: '2025-07-15', statut: 'en_cours' },
      { id: 'F08', intitule: 'Formation Maniema — nouvelles recrues', dureeJours: 90, nbParticipants: 180, dateDebut: '2025-06-15', dateFin: '2025-09-15', statut: 'en_cours' },
    ],
    niveauSecurite: 'sous_surveillance', coordonnees: { lat: -1.69, lng: 29.24 }, statut: 'actif'
  },
  {
    id: 'CF-004', code: 'EGM', nom: 'École du Génie Militaire — Lubumbashi',
    province: 'Katanga', localisation: 'Lubumbashi, Katanga', directeur: 'Col LUKUSA Emmanuel',
    capaciteAccueil: 350, stagiairesActuels: 210,
    specialites: ['Génie de combat', 'Déminage', 'Construction militaire', 'NBC (Nucléaire Biologique Chimique)'],
    formations: [
      { id: 'F09', intitule: 'Cours déminage et engins explosifs', dureeJours: 45, nbParticipants: 60, dateDebut: '2025-06-01', dateFin: '2025-07-16', statut: 'en_cours' },
      { id: 'F10', intitule: 'Formation protection NBC', dureeJours: 21, nbParticipants: 45, dateDebut: '2025-07-20', dateFin: '2025-08-10', statut: 'planifiee' },
    ],
    niveauSecurite: 'securisee', coordonnees: { lat: -11.68, lng: 27.50 }, statut: 'actif'
  },
  {
    id: 'CF-005', code: 'CFPA', nom: 'Centre de Formation Para-Commando — Kinshasa',
    province: 'Kinshasa', localisation: 'Kasangulu, Kinshasa', directeur: 'Col BOLAMBA',
    capaciteAccueil: 500, stagiairesActuels: 128,
    specialites: ['Para-commando', 'Opérations spéciales', 'Survie en milieu hostile', 'Saut en parachute'],
    formations: [
      { id: 'F11', intitule: 'Stage para-commando de base', dureeJours: 120, nbParticipants: 128, dateDebut: '2025-03-01', dateFin: '2025-06-30', statut: 'en_cours' },
      { id: 'F12', intitule: 'Stage opérations spéciales avancées', dureeJours: 90, nbParticipants: 48, dateDebut: '2025-09-01', dateFin: '2025-11-30', statut: 'planifiee' },
    ],
    niveauSecurite: 'securisee', coordonnees: { lat: -4.52, lng: 15.16 }, statut: 'actif'
  },
]

export const transfertsLogistique: TransfertLogistique[] = [
  {
    id: 'TRF-001', code: 'TRF-NK-2025-047',
    baseOrigineId: 'DEPOT-CENTRAL', baseOrigineNom: 'Dépôt Logistique Central Kinshasa',
    baseOrigineSecurite: 'securisee',
    baseDestinationId: 'BASE-GOMA', baseDestinationNom: 'Base Militaire de Goma',
    materiels: [
      { categorie: 'armement_leger', designation: 'Fusil AK-47 (7,62mm)', quantite: 500, unite: 'unités', classification: 'sensible' },
      { categorie: 'munitions', designation: 'Cartouches 7,62×39mm', quantite: 120000, unite: 'unités', classification: 'sensible' },
      { categorie: 'grenades', designation: 'Grenades F1 à fragmentation', quantite: 400, unite: 'unités', classification: 'tres_sensible' },
    ],
    responsableTransport: 'Adj NSIMBA Albert', effectifEscorte: 24, vehiculesConvoi: ['FARDC-CAM-012', 'FARDC-CAM-028', 'FARDC-BLD-001'],
    dateDepart: '2025-06-23T06:00:00Z', dateLivraisonPrevue: '2025-06-25T18:00:00Z',
    statut: 'deviation_alerte',
    routePlanifiee: [
      { lat: -4.38, lng: 15.48, checkpoint: 'Dépôt Central Kinshasa' },
      { lat: -5.04, lng: 18.82, checkpoint: 'Kikwit (CP1)' },
      { lat: -5.90, lng: 22.42, checkpoint: 'Kananga (CP2)' },
      { lat: -3.20, lng: 25.90, checkpoint: 'Kasongo (CP3)' },
      { lat: -1.67, lng: 29.22, checkpoint: 'Base Goma — Destination' },
    ],
    positionActuelle: { lat: -4.10, lng: 24.50, vitesse: 0 },
    deviationDetectee: true, deviationDistance: 1240,
    distanceParcourue: 1850, distanceTotale: 2340,
    validationSecurite: { validePar: 'Gal Bde KABILA', date: '2025-06-22T14:00:00Z', statut: 'approuve', commentaire: 'Approuvé. Escorte armée obligatoire.' },
    priorite: 'critique',
    alerteGPS: {
      type: 'deviation', description: 'Convoi dévié de 1.24 km de la route planifiée. Arrêt détecté à position -4.10, 24.50 depuis 47 min.',
      timestamp: '2025-06-23T15:43:00Z', position: { lat: -4.10, lng: 24.50 }
    },
    notes: 'Convoi critique — armement et munitions de combat opérationnel BTN-1011'
  },
  {
    id: 'TRF-002', code: 'TRF-SK-2025-031',
    baseOrigineId: 'DEPOT-CENTRAL', baseOrigineNom: 'Dépôt Logistique Central Kinshasa',
    baseOrigineSecurite: 'securisee',
    baseDestinationId: 'BASE-BUKU', baseDestinationNom: 'Base Militaire de Bukavu',
    materiels: [
      { categorie: 'drone', designation: 'Drone ISR DJI Matrice 300 RTK', quantite: 2, unite: 'unités', classification: 'tres_sensible' },
      { categorie: 'materiel_divers', designation: 'Batteries de rechange + stations sol', quantite: 4, unite: 'kits', classification: 'tres_sensible' },
    ],
    responsableTransport: 'Lt MWANGU Joséphine', effectifEscorte: 12, vehiculesConvoi: ['FARDC-LGR-045', 'FARDC-CMD-003'],
    dateDepart: '2025-06-24T08:00:00Z', dateLivraisonPrevue: '2025-06-26T16:00:00Z',
    statut: 'approuve',
    routePlanifiee: [
      { lat: -4.38, lng: 15.48, checkpoint: 'Dépôt Central Kinshasa' },
      { lat: -8.80, lng: 25.50, checkpoint: 'Kamina (CP1)' },
      { lat: -5.93, lng: 29.20, checkpoint: 'Kalemie (CP2)' },
      { lat: -2.49, lng: 28.85, checkpoint: 'Base Bukavu — Destination' },
    ],
    positionActuelle: undefined,
    deviationDetectee: false, distanceParcourue: 0, distanceTotale: 1980,
    validationSecurite: { validePar: 'Col MUTEBA', date: '2025-06-23T10:00:00Z', statut: 'approuve', commentaire: 'Matériel très sensible — escorte 12 hommes minimum.' },
    priorite: 'urgente',
    notes: 'Drones destinés au renforcement capacité ISR BDE-102'
  },
  {
    id: 'TRF-003', code: 'TRF-OR-2025-018',
    baseOrigineId: 'BASE-KIN-PRINCIPALE', baseOrigineNom: 'Base Principale Kinshasa — Camp Kokolo',
    baseOrigineSecurite: 'securisee',
    baseDestinationId: 'BASE-KIS', baseDestinationNom: 'Base Militaire de Kisangani',
    materiels: [
      { categorie: 'vehicule', designation: 'Camion Ural 4320', quantite: 3, unite: 'véhicules', classification: 'standard' },
      { categorie: 'vehicule', designation: 'Moto Honda XR150 militaire', quantite: 8, unite: 'véhicules', classification: 'standard' },
      { categorie: 'materiel_divers', designation: 'Carburant diesel (fûts 200L)', quantite: 40, unite: 'fûts', classification: 'standard' },
    ],
    responsableTransport: 'Sgt BANZA Sylvie', effectifEscorte: 16, vehiculesConvoi: ['FARDC-BLD-001', 'FARDC-LGR-089'],
    dateDepart: '2025-06-25T07:00:00Z', dateLivraisonPrevue: '2025-06-28T20:00:00Z',
    statut: 'en_preparation',
    routePlanifiee: [
      { lat: -4.32, lng: 15.32, checkpoint: 'Base Kinshasa — Départ' },
      { lat: -2.95, lng: 23.44, checkpoint: 'Lodja (CP1)' },
      { lat: 0.51, lng: 25.19, checkpoint: 'Base Kisangani — Arrivée' },
    ],
    positionActuelle: undefined,
    deviationDetectee: false, distanceParcourue: 0, distanceTotale: 1650,
    validationSecurite: { validePar: '', date: '', statut: 'en_attente' },
    priorite: 'normale',
    notes: 'Véhicules de renfort logistique pour RM-NORD'
  },
  {
    id: 'TRF-004', code: 'TRF-KAT-2025-022',
    baseOrigineId: 'BASE-LUBA', baseOrigineNom: 'Base Principale Lubumbashi',
    baseOrigineSecurite: 'securisee',
    baseDestinationId: 'BASE-BUKU', baseDestinationNom: 'Base Militaire de Bukavu',
    materiels: [
      { categorie: 'armement_lourd', designation: 'Mortier 82mm LM-60', quantite: 4, unite: 'pièces', classification: 'tres_sensible' },
      { categorie: 'munitions', designation: 'Obus 82mm HE/Illum', quantite: 800, unite: 'unités', classification: 'tres_sensible' },
      { categorie: 'vehicule', designation: 'Véhicule blindé BRDM-2M', quantite: 2, unite: 'véhicules', classification: 'tres_sensible' },
    ],
    responsableTransport: 'Cdt KASHAMA', effectifEscorte: 32, vehiculesConvoi: ['FARDC-BLD-008', 'FARDC-CAM-028'],
    dateDepart: '2025-06-23T05:30:00Z', dateLivraisonPrevue: '2025-06-24T22:00:00Z',
    statut: 'en_transit',
    routePlanifiee: [
      { lat: -11.66, lng: 27.47, checkpoint: 'Base Lubumbashi — Départ' },
      { lat: -5.93, lng: 29.20, checkpoint: 'Kalemie (CP1)' },
      { lat: -2.49, lng: 28.85, checkpoint: 'Base Bukavu — Arrivée' },
    ],
    positionActuelle: { lat: -7.80, lng: 28.90, vitesse: 48 },
    deviationDetectee: false, distanceParcourue: 680, distanceTotale: 1120,
    validationSecurite: { validePar: 'Gal Bde ILUNGA', date: '2025-06-22T16:00:00Z', statut: 'approuve', commentaire: 'Transfert validé. Armement lourd à sécuriser en priorité.' },
    priorite: 'urgente',
    notes: 'Renforcement capacité feu artillerie BDE-102'
  },
  {
    id: 'TRF-005', code: 'TRF-NK-2025-033',
    baseOrigineId: 'BASE-AV-RUTH', baseOrigineNom: 'Base Avancée Rutshuru',
    baseOrigineSecurite: 'compromise',
    baseDestinationId: 'POSTE-MASISI', baseDestinationNom: 'Poste d\'Observation Masisi',
    materiels: [
      { categorie: 'armement_leger', designation: 'Fusil AK-47', quantite: 50, unite: 'unités', classification: 'sensible' },
      { categorie: 'munitions', designation: 'Cartouches 7,62mm', quantite: 15000, unite: 'unités', classification: 'sensible' },
    ],
    responsableTransport: 'Sgt NGOMA', effectifEscorte: 8, vehiculesConvoi: ['FARDC-MTR-067'],
    dateDepart: undefined, dateLivraisonPrevue: '2025-06-26T12:00:00Z',
    statut: 'validation_securite',
    routePlanifiee: [
      { lat: -1.17, lng: 29.45, checkpoint: 'Base Rutshuru' },
      { lat: -1.37, lng: 28.82, checkpoint: 'Poste Masisi' },
    ],
    positionActuelle: undefined,
    deviationDetectee: false, distanceParcourue: 0, distanceTotale: 72,
    validationSecurite: { validePar: '', date: '', statut: 'en_attente', commentaire: 'ALERTE : origine compromise — validation commandant supérieur obligatoire.' },
    priorite: 'urgente',
    notes: 'AVERTISSEMENT : Base d\'origine en zone compromise. Validation supérieure requise avant départ.'
  },
  {
    id: 'TRF-006', code: 'TRF-KIN-2025-009',
    baseOrigineId: 'DEPOT-CENTRAL', baseOrigineNom: 'Dépôt Logistique Central',
    baseOrigineSecurite: 'securisee',
    baseDestinationId: 'BASE-GOMA', baseDestinationNom: 'Base Militaire de Goma',
    materiels: [
      { categorie: 'grenades', designation: 'Grenades fumigènes AN-M8', quantite: 200, unite: 'unités', classification: 'standard' },
      { categorie: 'grenades', designation: 'Grenades lacrymogènes CS-1', quantite: 300, unite: 'unités', classification: 'standard' },
      { categorie: 'materiel_divers', designation: 'Trousses médicales de combat', quantite: 120, unite: 'kits', classification: 'standard' },
    ],
    responsableTransport: 'Cpl BOLAMBA', effectifEscorte: 10, vehiculesConvoi: ['FARDC-CAM-028', 'FARDC-LGR-089'],
    dateDepart: '2025-06-21T06:00:00Z', dateLivraisonPrevue: '2025-06-23T20:00:00Z', dateLivraisonReelle: '2025-06-23T17:45:00Z',
    statut: 'livre',
    routePlanifiee: [
      { lat: -4.38, lng: 15.48, checkpoint: 'Dépôt Central' },
      { lat: -1.67, lng: 29.22, checkpoint: 'Base Goma' },
    ],
    positionActuelle: undefined,
    deviationDetectee: false, distanceParcourue: 2340, distanceTotale: 2340,
    validationSecurite: { validePar: 'Gal Bde KABILA', date: '2025-06-20T09:00:00Z', statut: 'approuve' },
    priorite: 'normale',
  },
]

export const statutPersonnel = [
  { name: 'Actifs', value: 98450, color: '#22c55e' },
  { name: 'En mission', value: 24680, color: '#3b82f6' },
  { name: 'En formation', value: 3240, color: '#a855f7' },
  { name: 'En permission', value: 4180, color: '#f59e0b' },
  { name: 'Blessés', value: 892, color: '#ef4444' },
  { name: 'Retraités', value: 3430, color: '#6b7280' },
]
