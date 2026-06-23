const mongoose = require('mongoose');

const CentreFormationSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  nom: { type: String, required: true },

  // Rattachement géographique
  zone: { type: mongoose.Schema.Types.ObjectId, ref: 'ZoneMilitaire' },
  region: { type: mongoose.Schema.Types.ObjectId, ref: 'RegionMilitaire' },
  province: { type: String, required: true },
  ville: { type: String },
  secteur: { type: String },

  localisation: {
    adresse: { type: String },
    coordonnees: { lat: { type: Number }, lng: { type: Number } },
  },

  capaciteAccueil: { type: Number, default: 0 },
  statut: {
    type: String,
    enum: ['actif', 'inactif', 'renovation', 'ferme'],
    default: 'actif',
  },
  force: {
    type: String,
    enum: ['terrestre', 'aerienne', 'maritime', 'emg', 'interarmees'],
    default: 'interarmees',
  },

  // Direction
  direction: {
    directeur: { type: mongoose.Schema.Types.ObjectId, ref: 'Militaire' },
    directeurAdjoint: { type: mongoose.Schema.Types.ObjectId, ref: 'Militaire' },
    chefPedagogique: { type: mongoose.Schema.Types.ObjectId, ref: 'Militaire' },
    chefInstructeurs: { type: mongoose.Schema.Types.ObjectId, ref: 'Militaire' },
    responsableLogistique: { type: mongoose.Schema.Types.ObjectId, ref: 'Militaire' },
    responsableMedical: { type: mongoose.Schema.Types.ObjectId, ref: 'Militaire' },
    responsableDisciplinaire: { type: mongoose.Schema.Types.ObjectId, ref: 'Militaire' },
  },

  // Catégories de formation dispensées
  categoriesFormation: [{
    type: String,
    enum: [
      'formation_initiale_recrue',
      'formation_initiale_soldat',
      'formation_initiale_sous_officier',
      'formation_initiale_officier',
      'forces_terrestres',
      'forces_aeriennes',
      'forces_navales',
      'forces_speciales',
      'renseignement',
      'transmission',
      'genie_militaire',
      'cyberdefense',
      'maintenance',
      'logistique',
      'sante_militaire',
      'leadership',
      'commandement',
      'gestion_crises',
    ],
  }],

  // Instructeurs
  instructeurs: [{
    militaire: { type: mongoose.Schema.Types.ObjectId, ref: 'Militaire' },
    specialite: { type: String },
    anneesExperience: { type: Number },
    certifications: [{ type: String }],
    modulesEnseignes: [{ type: String }],
    actif: { type: Boolean, default: true },
  }],

  // Programmes de formation
  programmes: [{
    code: { type: String },
    intitule: { type: String, required: true },
    categorie: { type: String },
    dureeJours: { type: Number },
    capacite: { type: Number },
    instructeur: { type: mongoose.Schema.Types.ObjectId, ref: 'Militaire' },
    actif: { type: Boolean, default: true },
  }],

  // Modules d'entraînement
  modulesEntrainement: [{
    type: String,
    enum: [
      'exercices_physiques', 'tir', 'parcours_obstacles', 'simulation_tactique',
      'manoeuvres_militaires', 'secourisme', 'combat_rapproche', 'cartographie',
      'navigation_gps', 'communications_radio', 'exercices_interarmees',
    ],
  }],

  // Infrastructure
  infrastructures: {
    sallesDeClasse: { type: Number, default: 0 },
    terrainsTir: { type: Number, default: 0 },
    parcoursCombat: { type: Number, default: 0 },
    simulateurs: { type: Number, default: 0 },
    dormitoires: { type: Number, default: 0 },
    capaciteHebergement: { type: Number, default: 0 },
    infirmerie: { type: Boolean, default: false },
    bibliotheque: { type: Boolean, default: false },
    centre_informatique: { type: Boolean, default: false },
    piscine: { type: Boolean, default: false },
  },

  // Statistiques courantes
  statistiques: {
    stagiairesCourants: { type: Number, default: 0 },
    instructeursActifs: { type: Number, default: 0 },
    formationsEnCours: { type: Number, default: 0 },
    diplomesCetteAnnee: { type: Number, default: 0 },
  },

  contact: {
    telephone: { type: String },
    email: { type: String },
  },

  dateCreation: { type: Date },
  notes: { type: String },
  actif: { type: Boolean, default: true },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
});

CentreFormationSchema.index({ province: 1 });
CentreFormationSchema.index({ zone: 1 });
CentreFormationSchema.index({ region: 1 });
CentreFormationSchema.index({ statut: 1 });

module.exports = mongoose.model('CentreFormation', CentreFormationSchema);
