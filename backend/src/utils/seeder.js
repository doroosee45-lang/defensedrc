require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Grade = require('../models/Grade');
const Unite = require('../models/Unite');
const Militaire = require('../models/Militaire');
const User = require('../models/User');
const Mission = require('../models/Mission');
const Vehicule = require('../models/Vehicule');
const Equipement = require('../models/Equipement');
const Alerte = require('../models/Alerte');
const BaseMilitaire = require('../models/BaseMilitaire');
const ZoneMilitaire = require('../models/ZoneMilitaire');
const RegionMilitaire = require('../models/RegionMilitaire');
const CentreFormation = require('../models/CentreFormation');

// ─── Données Grades FARDC ─────────────────────────────────────────────────────
const gradesData = [
  { code: 'GEN_ARMEE', nom: "Général d'Armée", abreviation: 'Gen Armée', categorie: 'officier_general', niveauHierarchique: 19, salaireBase: 5000, couleurInsigne: '#FFD700' },
  { code: 'GEN_CORPS', nom: 'Général de Corps d\'Armée', abreviation: 'Gen Corps', categorie: 'officier_general', niveauHierarchique: 18, salaireBase: 4500 },
  { code: 'GEN_DIV', nom: 'Général de Division', abreviation: 'Gen Div', categorie: 'officier_general', niveauHierarchique: 17, salaireBase: 4000 },
  { code: 'GEN_BRI', nom: 'Général de Brigade', abreviation: 'Gen Brig', categorie: 'officier_general', niveauHierarchique: 16, salaireBase: 3500 },
  { code: 'COL', nom: 'Colonel', abreviation: 'Col', categorie: 'officier_superieur', niveauHierarchique: 15, salaireBase: 3000 },
  { code: 'LT_COL', nom: 'Lieutenant-Colonel', abreviation: 'Lt-Col', categorie: 'officier_superieur', niveauHierarchique: 14, salaireBase: 2500 },
  { code: 'CDT', nom: 'Commandant', abreviation: 'Cdt', categorie: 'officier_superieur', niveauHierarchique: 13, salaireBase: 2200 },
  { code: 'CPT', nom: 'Capitaine', abreviation: 'Cpt', categorie: 'officier_subalterne', niveauHierarchique: 12, salaireBase: 1800 },
  { code: 'LIEUT', nom: 'Lieutenant', abreviation: 'Lt', categorie: 'officier_subalterne', niveauHierarchique: 11, salaireBase: 1500 },
  { code: 'S_LIEUT', nom: 'Sous-Lieutenant', abreviation: 'S-Lt', categorie: 'officier_subalterne', niveauHierarchique: 10, salaireBase: 1200 },
  { code: 'ADJ_CHF', nom: 'Adjudant-Chef', abreviation: 'Adj-Chef', categorie: 'sous_officier', niveauHierarchique: 9, salaireBase: 900 },
  { code: 'ADJ', nom: 'Adjudant', abreviation: 'Adj', categorie: 'sous_officier', niveauHierarchique: 8, salaireBase: 800 },
  { code: 'S_ADJ', nom: 'Sous-Adjudant', abreviation: 'S-Adj', categorie: 'sous_officier', niveauHierarchique: 7, salaireBase: 700 },
  { code: 'S_CHF', nom: 'Sergent-Chef', abreviation: 'Sgt-Chef', categorie: 'sous_officier', niveauHierarchique: 6, salaireBase: 600 },
  { code: 'SGT', nom: 'Sergent', abreviation: 'Sgt', categorie: 'sous_officier', niveauHierarchique: 5, salaireBase: 500 },
  { code: 'CPL_CHF', nom: 'Caporal-Chef', abreviation: 'Cpl-Chef', categorie: 'sous_officier', niveauHierarchique: 4, salaireBase: 400 },
  { code: 'CPL', nom: 'Caporal', abreviation: 'Cpl', categorie: 'soldat', niveauHierarchique: 3, salaireBase: 350 },
  { code: 'SOLD_1', nom: 'Soldat de 1ère classe', abreviation: 'S/1cl', categorie: 'soldat', niveauHierarchique: 2, salaireBase: 300 },
  { code: 'SOLD', nom: 'Soldat', abreviation: 'Sdt', categorie: 'soldat', niveauHierarchique: 1, salaireBase: 250 },
];

// ─── Données Unités ───────────────────────────────────────────────────────────
const getUnitesData = () => [
  { code: 'EMG', nom: 'État-Major Général', type: 'emg', force: 'emg', sigle: 'EMG' },
  { code: 'FTR', nom: 'Forces Terrestres', type: 'force', force: 'terrestre', sigle: 'FTR' },
  { code: 'FAC', nom: 'Force Aérienne Congolaise', type: 'force', force: 'aerienne', sigle: 'FAC' },
  { code: 'FNI', nom: 'Force Navale et Fluviale', type: 'force', force: 'maritime', sigle: 'FNI' },
  { code: 'ZD_KINSHASA', nom: 'Zone de Défense de Kinshasa', type: 'zone_defense', force: 'terrestre', localisation: { province: 'Kinshasa', coordonnees: { lat: -4.3276, lng: 15.3136 } } },
  { code: 'ZD_NORD_KIVU', nom: 'Zone de Défense du Nord-Kivu', type: 'zone_defense', force: 'terrestre', localisation: { province: 'Nord-Kivu', coordonnees: { lat: -1.5177, lng: 29.3644 } } },
  { code: 'ZD_SUD_KIVU', nom: 'Zone de Défense du Sud-Kivu', type: 'zone_defense', force: 'terrestre', localisation: { province: 'Sud-Kivu', coordonnees: { lat: -2.5077, lng: 28.8594 } } },
  { code: '31_BRI', nom: '31e Brigade', type: 'brigade', force: 'terrestre', localisation: { province: 'Nord-Kivu', territoire: 'Rutshuru' } },
  { code: '34_BRI', nom: '34e Brigade', type: 'brigade', force: 'terrestre', localisation: { province: 'Ituri' } },
  { code: '101_BN', nom: '101e Bataillon d\'Infanterie', type: 'bataillon', force: 'terrestre', localisation: { province: 'Kinshasa' } },
];

// ─── Données Utilisateurs (un par niveau hiérarchique) ───────────────────────
const getUsersData = (uniteEMG, zdNordKivu, bri31, zone3Id, reg34Id) => [
  // Niv.1 — Présidence
  { matricule: 'SOUVERAIN-001', nom: 'KABILA', prenom: 'Joseph', email: 'presidence@rdc.cd', password: 'Souverain@2024!', role: 'souverain', grade: 'Commandant Suprême', unite: uniteEMG, mfaEnabled: false, actif: true, scope: { perimetre: 'national' }, permissions: { lecture: true, ecriture: true, suppression: true, export: true, impression: true } },
  // Niv.1b — Super Admin système
  { matricule: 'ADM-003-SYS', nom: 'SYSTEM', prenom: 'Admin', email: 'admin@milsys.cd', password: 'SuperAdmin@2024!', role: 'super_admin', grade: '', mfaEnabled: false, actif: true, scope: { perimetre: 'national' }, permissions: { lecture: true, ecriture: true, suppression: true, export: true, impression: true } },
  // Niv.2 — Ministère de la Défense
  { matricule: 'GEN-001-EMG', nom: 'MEYA', prenom: 'Jean-Paul', email: 'oseedoro@gmail.com', password: 'Admin@2024!', role: 'admin_national', grade: "Général de Corps d'Armée", unite: uniteEMG, mfaEnabled: false, actif: true, scope: { perimetre: 'national' }, permissions: { lecture: true, ecriture: true, suppression: true, export: true, impression: true } },
  // Niv.3 — Admin Zone Militaire (3ème Zone — Est)
  { matricule: 'ZM3-001', nom: 'NKUNDA', prenom: 'Laurent', email: 'l.nkunda@fardc.cd', password: 'ZoneEst@2024!', role: 'admin_zone', grade: 'Général de Division', unite: zdNordKivu, mfaEnabled: false, actif: true, scope: { zone: '3ème Zone Militaire', zoneRef: zone3Id, perimetre: 'zone' }, permissions: { lecture: true, ecriture: true, suppression: false, export: true, impression: true } },
  // Niv.4 — Admin Région Militaire (34e Région — Nord-Kivu)
  { matricule: 'RM34-001', nom: 'MAKENGA', prenom: 'Sultani', email: 's.makenga@fardc.cd', password: 'Region34@2024!', role: 'admin_region', grade: 'Général de Brigade', unite: zdNordKivu, mfaEnabled: false, actif: true, scope: { zone: '3ème Zone Militaire', zoneRef: zone3Id, region: '34e Région Militaire', regionRef: reg34Id, perimetre: 'regional' }, permissions: { lecture: true, ecriture: true, suppression: false, export: true, impression: true } },
  // Niv.5 — Admin Provincial (Nord-Kivu)
  { matricule: 'PROV-NKV-001', nom: 'BISIMWA', prenom: 'Claude', email: 'c.bisimwa@fardc.cd', password: 'ProvNKV@2024!', role: 'admin_provincial', grade: 'Colonel', unite: zdNordKivu, mfaEnabled: false, actif: true, scope: { zone: '3ème Zone Militaire', zoneRef: zone3Id, region: '34e Région Militaire', regionRef: reg34Id, province: 'Nord-Kivu', perimetre: 'provincial' }, permissions: { lecture: true, ecriture: true, suppression: false, export: true, impression: true } },
  // Niv.6 — Admin Territorial (Rutshuru)
  { matricule: 'TERR-RTH-001', nom: 'MUHINDO', prenom: 'Paul', email: 'p.muhindo@fardc.cd', password: 'TerritRTH@2024!', role: 'admin_territorial', grade: 'Lieutenant-Colonel', unite: bri31, mfaEnabled: false, actif: true, scope: { province: 'Nord-Kivu', territoire: 'Rutshuru', perimetre: 'territorial' }, permissions: { lecture: true, ecriture: true, suppression: false, export: true, impression: true } },
  // Niv.7 — Admin Sectoriel (Secteur Alpha)
  { matricule: 'SECT-ALF-001', nom: 'KAMBALE', prenom: 'Denis', email: 'd.kambale@fardc.cd', password: 'SectAlpha@2024!', role: 'admin_sectoriel', grade: 'Commandant', unite: bri31, mfaEnabled: false, actif: true, scope: { province: 'Nord-Kivu', territoire: 'Rutshuru', secteur: 'Secteur Alpha', perimetre: 'sectoriel' }, permissions: { lecture: true, ecriture: true, suppression: false, export: false, impression: true } },
  // Officier commandant
  { matricule: 'COL-002-EMG', nom: 'MUTOMBO', prenom: 'Pierre', email: 'p.mutombo@fardc.cd', password: 'User@2024!', role: 'officier_commandant', grade: 'Colonel', unite: uniteEMG, mfaEnabled: false, actif: true, scope: { perimetre: 'national' } },
];

// ─── Main Seeder ──────────────────────────────────────────────────────────────
const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[Seeder] Connecté à MongoDB');

    // En production, skip si la base est déjà initialisée
    if (process.env.NODE_ENV === 'production') {
      const existingUsers = await User.countDocuments();
      if (existingUsers > 0) {
        console.log(`[Seeder] Base déjà initialisée (${existingUsers} utilisateurs). Seed ignoré.`);
        await mongoose.disconnect();
        return;
      }
      console.log('[Seeder] Base vide — initialisation de la base de production...');
    }

    // Nettoyage
    await Promise.all([
      Grade.deleteMany(), Unite.deleteMany(), Militaire.deleteMany(),
      User.deleteMany(), Mission.deleteMany(), Vehicule.deleteMany(),
      Equipement.deleteMany(), Alerte.deleteMany(), BaseMilitaire.deleteMany(),
      ZoneMilitaire.deleteMany(), RegionMilitaire.deleteMany(), CentreFormation.deleteMany(),
    ]);
    console.log('[Seeder] Base de données nettoyée');

    // ── Zones Militaires ────────────────────────────────────────────────────────
    const zone1 = await ZoneMilitaire.create({
      numero: 1, code: 'ZM1', nom: '1ère Zone Militaire',
      quartierGeneral: 'Kinshasa', nombreRegions: 4, nombreProvinces: 6,
      localisation: { province: 'Kinshasa', coordonnees: { lat: -4.3276, lng: 15.3136 } },
    });
    const zone2 = await ZoneMilitaire.create({
      numero: 2, code: 'ZM2', nom: '2ème Zone Militaire',
      quartierGeneral: 'Lubumbashi', nombreRegions: 2, nombreProvinces: 9,
      localisation: { province: 'Haut-Katanga', coordonnees: { lat: -11.6609, lng: 27.4794 } },
    });
    const zone3 = await ZoneMilitaire.create({
      numero: 3, code: 'ZM3', nom: '3ème Zone Militaire',
      quartierGeneral: 'Est de la RDC', nombreRegions: 4, nombreProvinces: 7,
      localisation: { province: 'Nord-Kivu', coordonnees: { lat: -1.5177, lng: 29.3644 } },
    });
    console.log('[Seeder] 3 Zones Militaires créées');

    // ── Régions Militaires (10 régions — toutes les 26 provinces de RDC) ────────
    const reg11 = await RegionMilitaire.create({
      numero: 11, code: 'RM11', nom: '11e Région Militaire', zone: zone1._id,
      quartierGeneral: 'Bandundu', provinces: ['Kwango', 'Kwilu', 'Mai-Ndombe'],
      localisation: { province: 'Kwilu', coordonnees: { lat: -3.3211, lng: 17.3683 } },
    });
    const reg12 = await RegionMilitaire.create({
      numero: 12, code: 'RM12', nom: '12e Région Militaire', zone: zone1._id,
      quartierGeneral: 'Matadi', provinces: ['Kongo-Central'],
      localisation: { province: 'Kongo-Central', coordonnees: { lat: -5.8167, lng: 13.4500 } },
    });
    const reg13 = await RegionMilitaire.create({
      numero: 13, code: 'RM13', nom: '13e Région Militaire', zone: zone1._id,
      quartierGeneral: 'Mbandaka', provinces: ['Équateur', 'Mongala', 'Nord-Ubangi', 'Sud-Ubangi', 'Tshuapa'],
      localisation: { province: 'Équateur', coordonnees: { lat: 0.0472, lng: 18.2562 } },
    });
    const reg14 = await RegionMilitaire.create({
      numero: 14, code: 'RM14', nom: '14e Région Militaire', zone: zone1._id,
      quartierGeneral: 'Kinshasa', provinces: ['Kinshasa'],
      localisation: { province: 'Kinshasa', coordonnees: { lat: -4.3276, lng: 15.3136 } },
    });
    const reg21 = await RegionMilitaire.create({
      numero: 21, code: 'RM21', nom: '21e Région Militaire', zone: zone2._id,
      quartierGeneral: 'Mbuji-Mayi', provinces: ['Kasaï', 'Kasaï-Central', 'Kasaï-Oriental', 'Lomami', 'Sankuru'],
      localisation: { province: 'Kasaï-Central', coordonnees: { lat: -6.1360, lng: 23.5897 } },
    });
    const reg22 = await RegionMilitaire.create({
      numero: 22, code: 'RM22', nom: '22e Région Militaire', zone: zone2._id,
      quartierGeneral: 'Lubumbashi', provinces: ['Haut-Lomami', 'Haut-Katanga', 'Lualaba', 'Tanganyika'],
      localisation: { province: 'Haut-Katanga', coordonnees: { lat: -11.6609, lng: 27.4794 } },
    });
    const reg31 = await RegionMilitaire.create({
      numero: 31, code: 'RM31', nom: '31e Région Militaire', zone: zone3._id,
      quartierGeneral: 'Kisangani', provinces: ['Bas-Uele', 'Tshopo'],
      localisation: { province: 'Tshopo', coordonnees: { lat: 0.5153, lng: 25.1946 } },
    });
    const reg32 = await RegionMilitaire.create({
      numero: 32, code: 'RM32', nom: '32e Région Militaire', zone: zone3._id,
      quartierGeneral: 'Bunia', provinces: ['Haut-Uele', 'Ituri'],
      localisation: { province: 'Ituri', coordonnees: { lat: 1.5569, lng: 30.2100 } },
    });
    const reg33 = await RegionMilitaire.create({
      numero: 33, code: 'RM33', nom: '33e Région Militaire', zone: zone3._id,
      quartierGeneral: 'Bukavu', provinces: ['Maniema', 'Sud-Kivu'],
      localisation: { province: 'Sud-Kivu', coordonnees: { lat: -2.5077, lng: 28.8594 } },
    });
    const reg34 = await RegionMilitaire.create({
      numero: 34, code: 'RM34', nom: '34e Région Militaire', zone: zone3._id,
      quartierGeneral: 'Goma', provinces: ['Nord-Kivu'],
      localisation: { province: 'Nord-Kivu', coordonnees: { lat: -1.6806, lng: 29.2233 } },
    });
    console.log('[Seeder] 10 Régions Militaires créées (26 provinces couvertes)');

    // Grades
    const grades = await Grade.insertMany(gradesData);
    console.log(`[Seeder] ${grades.length} grades créés`);

    // Unités
    const unitesRaw = getUnitesData();
    const emg = await Unite.create(unitesRaw[0]);
    const ftr = await Unite.create({ ...unitesRaw[1], parent: emg._id });
    const fac = await Unite.create({ ...unitesRaw[2], parent: emg._id });
    const fni = await Unite.create({ ...unitesRaw[3], parent: emg._id });
    const zdKinshasa = await Unite.create({ ...unitesRaw[4], parent: ftr._id });
    const zdNordKivu = await Unite.create({ ...unitesRaw[5], parent: ftr._id });
    const zdSudKivu = await Unite.create({ ...unitesRaw[6], parent: ftr._id });
    const bri31 = await Unite.create({ ...unitesRaw[7], parent: zdNordKivu._id });
    const bri34 = await Unite.create({ ...unitesRaw[8], parent: zdNordKivu._id });
    const bn101 = await Unite.create({ ...unitesRaw[9], parent: zdKinshasa._id });
    console.log('[Seeder] 10 unités créées');

    // Users (un par niveau hiérarchique) — zone3 et reg34 créés plus haut
    const usersData = getUsersData(emg._id, zdNordKivu._id, bri31._id, zone3._id, reg34._id);
    for (const userData of usersData) {
      await User.create(userData);
    }
    console.log(`[Seeder] ${usersData.length} utilisateurs créés`);

    // Militaires
    const gradeMap = {};
    grades.forEach((g) => { gradeMap[g.code] = g; });

    const militairesData = [
      { matricule: 'MIL-2019-0001', nom: 'MWAMBA', prenom: 'Henri', dateNaissance: new Date('1975-03-15'), sexe: 'M', grade: gradeMap['GEN_BRI']._id, gradeNom: 'Général de Brigade', unite: zdNordKivu._id, uniteNom: 'Zone de Défense du Nord-Kivu', force: 'terrestre', statut: 'actif', fonction: 'Commandant de Zone', dateEngagement: new Date('1995-01-01'), province: 'Nord-Kivu', ville: 'Goma', groupeSanguin: 'O+' },
      { matricule: 'MIL-2018-0042', nom: 'TSHISEKEDI', prenom: 'Marie', dateNaissance: new Date('1985-07-22'), sexe: 'F', grade: gradeMap['CPT']._id, gradeNom: 'Capitaine', unite: emg._id, uniteNom: 'État-Major Général', force: 'terrestre', statut: 'actif', fonction: 'Officier de Renseignement', dateEngagement: new Date('2005-06-01'), province: 'Kinshasa', ville: 'Kinshasa', groupeSanguin: 'A+' },
      { matricule: 'MIL-2020-0156', nom: 'KASONGO', prenom: 'Robert', dateNaissance: new Date('1990-11-08'), sexe: 'M', grade: gradeMap['LT_COL']._id, gradeNom: 'Lieutenant-Colonel', unite: bri31._id, uniteNom: '31e Brigade', force: 'terrestre', statut: 'mission', fonction: 'Commandant de Brigade', dateEngagement: new Date('2010-01-15'), province: 'Nord-Kivu', groupeSanguin: 'B+' },
      { matricule: 'MIL-2021-0089', nom: 'LUKUSA', prenom: 'Brigitte', dateNaissance: new Date('1993-04-30'), sexe: 'F', grade: gradeMap['LIEUT']._id, gradeNom: 'Lieutenant', unite: bn101._id, uniteNom: '101e Bataillon', force: 'terrestre', statut: 'actif', fonction: 'Officier de section', dateEngagement: new Date('2015-09-01'), province: 'Kinshasa', groupeSanguin: 'AB+' },
      { matricule: 'MIL-2017-0234', nom: 'NGOY', prenom: 'Emmanuel', dateNaissance: new Date('1980-12-05'), sexe: 'M', grade: gradeMap['SGT']._id, gradeNom: 'Sergent', unite: bri34._id, uniteNom: '34e Brigade', force: 'terrestre', statut: 'actif', dateEngagement: new Date('2000-03-10'), province: 'Ituri', groupeSanguin: 'O-' },
    ];

    const militaires = await Militaire.insertMany(militairesData);
    console.log(`[Seeder] ${militaires.length} militaires créés`);

    // Missions
    const missionsData = [
      {
        code: 'OP-2024-001',
        nom: 'Opération Bouclier Est',
        type: 'securisation',
        statut: 'en_cours',
        priorite: 'haute',
        classification: 'confidentiel',
        commandant: militaires[0]._id,
        unitesPrincipales: [bri31._id, bri34._id],
        dateDebut: new Date('2024-01-15'),
        dateFinPrevue: new Date('2024-06-30'),
        zoneOperation: { nom: 'Secteur Est Rutshuru', province: 'Nord-Kivu', territoire: 'Rutshuru', coordonnees: [{ lat: -1.2, lng: 29.4 }] },
        objectifs: ['Sécuriser les axes routiers', 'Protéger les populations civiles', 'Neutraliser les groupes armés'],
        description: 'Opération de sécurisation de l\'axe Rutshuru-Goma',
      },
      {
        code: 'OP-2024-002',
        nom: 'Opération Paix Ituri',
        type: 'humanitaire',
        statut: 'planifiee',
        priorite: 'normale',
        classification: 'interne',
        commandant: militaires[2]._id,
        unitesPrincipales: [bri34._id],
        dateDebut: new Date('2024-03-01'),
        dateFinPrevue: new Date('2024-05-31'),
        zoneOperation: { nom: 'District de l\'Ituri', province: 'Ituri' },
        objectifs: ['Distribution aide humanitaire', 'Protection des civils', 'Escorte convois ONG'],
      },
    ];

    const missions = await Mission.insertMany(missionsData);
    console.log(`[Seeder] ${missions.length} missions créées`);

    // Véhicules
    const vehiculesData = [
      { immatriculation: 'FARDC-001-KIN', designation: 'Land Cruiser Blindé', type: 'vehicule_commandement', marque: 'Toyota', modele: 'Land Cruiser 200', statut: 'disponible', unite: emg._id, niveauCarburant: 85, valeurUSD: 120000 },
      { immatriculation: 'FARDC-002-NKV', designation: 'BTR-80 Véhicule Blindé', type: 'blinde', marque: 'GAZ', modele: 'BTR-80', statut: 'en_mission', unite: bri31._id, niveauCarburant: 60, valeurUSD: 500000 },
      { immatriculation: 'FARDC-003-KIN', designation: 'Camion Logistique', type: 'camion', marque: 'Mercedes', modele: 'Actros', statut: 'disponible', unite: bn101._id, niveauCarburant: 90, valeurUSD: 80000 },
      { immatriculation: 'FARDC-DRONE-01', designation: 'Drone de Reconnaissance', type: 'drone', marque: 'DJI', modele: 'Matrice 300', statut: 'disponible', unite: emg._id, valeurUSD: 15000 },
    ];

    const vehicules = await Vehicule.insertMany(vehiculesData);
    console.log(`[Seeder] ${vehicules.length} véhicules créés`);

    // Équipements
    const equipementsData = [
      { code: 'AK47-001', designation: 'Fusil AK-47', type: 'arme', marque: 'Kalachnikov', statut: 'assigne', etat: 'bon', quantite: 500, quantiteDisponible: 420, unite: bri31._id, valeurUSD: 300 },
      { code: 'RPG-001', designation: 'Lance-roquettes RPG-7', type: 'arme', statut: 'disponible', etat: 'bon', quantite: 50, quantiteDisponible: 45, unite: bri31._id, valeurUSD: 2000 },
      { code: 'RADIO-HARRIS', designation: 'Radio HARRIS RF-5800', type: 'communication', statut: 'disponible', etat: 'excellent', quantite: 30, quantiteDisponible: 28, unite: emg._id, valeurUSD: 5000 },
      { code: 'GILET-BALIST', designation: 'Gilet balistique niveau IV', type: 'protection', statut: 'assigne', etat: 'bon', quantite: 200, quantiteDisponible: 180, unite: bri34._id, valeurUSD: 800 },
    ];

    const equipements = await Equipement.insertMany(equipementsData);
    console.log(`[Seeder] ${equipements.length} équipements créés`);

    // Bases Militaires
    const basesData = [
      {
        code: 'BASE-KIN-001',
        nom: 'Camp Tshatshi',
        type: 'base_principale',
        force: 'terrestre',
        statut: 'operationnelle',
        niveauSecurite: 'secret',
        unite: emg._id,
        localisation: { province: 'Kinshasa', adresse: 'Camp Tshatshi, Kinshasa', coordonnees: { lat: -4.3276, lng: 15.3136 } },
        capacite: { personnel: 5000, vehicules: 500 },
        stocks: { carburantLitres: 50000, vivresJours: 30, munitionsStatut: 'normal', medicamentsStatut: 'normal' },
      },
      {
        code: 'BASE-GOMA-001',
        nom: 'Base Opérationnelle de Goma',
        type: 'base_avancee',
        force: 'terrestre',
        statut: 'operationnelle',
        niveauSecurite: 'confidentiel',
        unite: zdNordKivu._id,
        localisation: { province: 'Nord-Kivu', territoire: 'Goma', coordonnees: { lat: -1.6806, lng: 29.2233 } },
        capacite: { personnel: 2000, vehicules: 150 },
        stocks: { carburantLitres: 20000, vivresJours: 15, munitionsStatut: 'normal', medicamentsStatut: 'bas' },
      },
    ];

    const bases = await BaseMilitaire.insertMany(basesData);
    console.log(`[Seeder] ${bases.length} bases militaires créées`);

    // Centres de Formation Militaires
    const centresData = [
      {
        code: 'CFM-KIN-001', nom: 'Centre de Formation Militaire de Kinshasa',
        zone: zone1._id, region: reg14._id,
        province: 'Kinshasa', ville: 'Kinshasa',
        localisation: { adresse: 'Camp Kokolo, Kinshasa', coordonnees: { lat: -4.3450, lng: 15.3000 } },
        capaciteAccueil: 1200, statut: 'actif', force: 'interarmees',
        categoriesFormation: ['formation_initiale_recrue', 'formation_initiale_officier', 'leadership', 'commandement'],
        modulesEntrainement: ['exercices_physiques', 'tir', 'parcours_obstacles', 'simulation_tactique', 'combat_rapproche'],
        infrastructures: { sallesDeClasse: 20, terrainsTir: 4, parcoursCombat: 2, dormitoires: 10, capaciteHebergement: 1200, infirmerie: true, bibliotheque: true, centre_informatique: true },
        statistiques: { stagiairesCourants: 340, instructeursActifs: 45, formationsEnCours: 8, diplomesCetteAnnee: 120 },
        contact: { telephone: '+243 81 234 5678', email: 'cfm.kinshasa@fardc.cd' },
        dateCreation: new Date('1964-06-30'),
      },
      {
        code: 'CFM-GOMA-001', nom: 'Centre de Formation Spécialisée de Goma',
        zone: zone3._id, region: reg34._id,
        province: 'Nord-Kivu', ville: 'Goma',
        localisation: { adresse: 'Base de Goma, Nord-Kivu', coordonnees: { lat: -1.6900, lng: 29.2300 } },
        capaciteAccueil: 400, statut: 'actif', force: 'terrestre',
        categoriesFormation: ['forces_terrestres', 'forces_speciales', 'renseignement', 'gestion_crises'],
        modulesEntrainement: ['simulation_tactique', 'manoeuvres_militaires', 'navigation_gps', 'communications_radio'],
        infrastructures: { sallesDeClasse: 8, terrainsTir: 3, parcoursCombat: 1, dormitoires: 6, capaciteHebergement: 400, infirmerie: true, bibliotheque: false, centre_informatique: true },
        statistiques: { stagiairesCourants: 120, instructeursActifs: 18, formationsEnCours: 3, diplomesCetteAnnee: 45 },
        contact: { telephone: '+243 97 456 7890', email: 'cfm.goma@fardc.cd' },
        dateCreation: new Date('1998-01-15'),
      },
      {
        code: 'CFM-LSHI-001', nom: "Académie Militaire de Lubumbashi",
        zone: zone2._id, region: reg22._id,
        province: 'Haut-Katanga', ville: 'Lubumbashi',
        localisation: { adresse: 'Camp Massart, Lubumbashi', coordonnees: { lat: -11.6650, lng: 27.4800 } },
        capaciteAccueil: 600, statut: 'actif', force: 'interarmees',
        categoriesFormation: ['formation_initiale_officier', 'formation_initiale_sous_officier', 'leadership', 'logistique', 'cyberdefense'],
        modulesEntrainement: ['exercices_physiques', 'tir', 'cartographie', 'navigation_gps', 'communications_radio', 'exercices_interarmees'],
        infrastructures: { sallesDeClasse: 15, terrainsTir: 3, parcoursCombat: 2, simulateurs: 2, dormitoires: 8, capaciteHebergement: 600, infirmerie: true, bibliotheque: true, centre_informatique: true, piscine: true },
        statistiques: { stagiairesCourants: 200, instructeursActifs: 30, formationsEnCours: 6, diplomesCetteAnnee: 80 },
        contact: { telephone: '+243 97 789 0123', email: 'academie.lshi@fardc.cd' },
        dateCreation: new Date('1975-09-01'),
      },
    ];
    const centres = await CentreFormation.insertMany(centresData);
    console.log(`[Seeder] ${centres.length} centres de formation créés`);

    // Alertes
    const alertesData = [
      { titre: 'Mouvement suspects détectés - Axe Rutshuru', description: 'Observation de mouvements de groupes armés non identifiés sur l\'axe Rutshuru-Goma km 45', type: 'securite', niveau: 'haute', statut: 'active', unitesConcernees: [bri31._id], localisation: { province: 'Nord-Kivu', territoire: 'Rutshuru' } },
      { titre: 'Stock munitions bas - Base Goma', description: 'Le stock de munitions de la base de Goma est en dessous du seuil critique (15%)', type: 'logistique', niveau: 'moyenne', statut: 'active', unitesConcernees: [zdNordKivu._id] },
      { titre: 'Personnel médical insuffisant - Ituri', description: 'Manque de personnel médical dans les unités déployées en Ituri', type: 'medical', niveau: 'haute', statut: 'active', unitesConcernees: [bri34._id] },
    ];

    const alertes = await Alerte.insertMany(alertesData);
    console.log(`[Seeder] ${alertes.length} alertes créées`);

    console.log('\n[Seeder] ✅ Données initiales chargées avec succès!');
    console.log('\n[Seeder] Comptes créés par niveau hiérarchique:');
    console.log('──────────────────────────────────────────────────────────────────────');
    console.log('  Niv.1  Présidence      : SOUVERAIN-001 | Souverain@2024!  | National');
    console.log('  Niv.1b Super Admin     : ADM-003-SYS   | SuperAdmin@2024! | National');
    console.log('  Niv.2  Admin National  : GEN-001-EMG   | Admin@2024!      | National');
    console.log('  Niv.3  Admin Zone      : ZM3-001       | ZoneEst@2024!    | 3ème Zone');
    console.log('  Niv.4  Admin Région    : RM34-001      | Region34@2024!   | 34e Région');
    console.log('  Niv.5  Admin Provincial: PROV-NKV-001  | ProvNKV@2024!    | Nord-Kivu');
    console.log('  Niv.6  Admin Territ.   : TERR-RTH-001  | TerritRTH@2024!  | Rutshuru');
    console.log('  Niv.7  Admin Sectoriel : SECT-ALF-001  | SectAlpha@2024!  | Secteur Alpha');
    console.log('  Officier               : COL-002-EMG   | User@2024!       | National');
    console.log('──────────────────────────────────────────────────────────────────────');

    process.exit(0);
  } catch (error) {
    console.error('[Seeder] Erreur:', error);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[Seeder] Connecté à MongoDB');

    await Promise.all([
      Grade.deleteMany(), Unite.deleteMany(), Militaire.deleteMany(),
      User.deleteMany(), Mission.deleteMany(), Vehicule.deleteMany(),
      Equipement.deleteMany(), Alerte.deleteMany(), BaseMilitaire.deleteMany(),
    ]);

    console.log('[Seeder] ✅ Toutes les données supprimées');
    process.exit(0);
  } catch (error) {
    console.error('[Seeder] Erreur:', error);
    process.exit(1);
  }
};

if (process.argv[2] === '--destroy') {
  destroyData();
} else {
  importData();
}
