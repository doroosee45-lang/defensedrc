const mongoose = require('mongoose');

const BaseMilitaireSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  nom: { type: String, required: true },
  type: {
    type: String,
    enum: ['base_principale', 'base_avancee', 'camp', 'poste', 'depot', 'hopital_militaire'],
    required: true,
  },
  force: {
    type: String,
    enum: ['terrestre', 'aerienne', 'maritime', 'emg', 'multiple'],
    default: 'terrestre',
  },
  statut: {
    type: String,
    enum: ['operationnelle', 'en_construction', 'renovation', 'fermee', 'abandonnee', 'reservee'],
    default: 'operationnelle',
  },
  niveauSecurite: {
    type: String,
    enum: ['ouvert', 'restreint', 'confidentiel', 'secret'],
    default: 'restreint',
  },

  // Rattachement hiérarchique géographique
  zone: { type: mongoose.Schema.Types.ObjectId, ref: 'ZoneMilitaire' },
  region: { type: mongoose.Schema.Types.ObjectId, ref: 'RegionMilitaire' },
  unite: { type: mongoose.Schema.Types.ObjectId, ref: 'Unite' },

  // Localisation complète
  localisation: {
    province: { type: String, required: true },
    territoire: { type: String },
    secteur: { type: String },
    adresse: { type: String },
    coordonnees: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    altitude: { type: Number },
  },

  // Commandement complet de la base
  commandement: {
    commandant: { type: mongoose.Schema.Types.ObjectId, ref: 'Militaire' },
    commandantAdjoint: { type: mongoose.Schema.Types.ObjectId, ref: 'Militaire' },
    chefEtatMajor: { type: mongoose.Schema.Types.ObjectId, ref: 'Militaire' },
    chefOperations: { type: mongoose.Schema.Types.ObjectId, ref: 'Militaire' },
    chefRenseignement: { type: mongoose.Schema.Types.ObjectId, ref: 'Militaire' },
    chefLogistique: { type: mongoose.Schema.Types.ObjectId, ref: 'Militaire' },
    chefRH: { type: mongoose.Schema.Types.ObjectId, ref: 'Militaire' },
    chefSecurite: { type: mongoose.Schema.Types.ObjectId, ref: 'Militaire' },
  },

  // Rétrocompatibilité (deprecated → utiliser commandement.commandant)
  commandant: { type: mongoose.Schema.Types.ObjectId, ref: 'Militaire' },

  // Capacités
  capacite: {
    personnel: { type: Number, default: 0 },
    vehicules: { type: Number, default: 0 },
    avions: { type: Number, default: 0 },
    bateaux: { type: Number, default: 0 },
  },

  effectifActuel: {
    officiers: { type: Number, default: 0 },
    sousOfficiers: { type: Number, default: 0 },
    soldats: { type: Number, default: 0 },
    civilians: { type: Number, default: 0 },
  },

  // Infrastructures détaillées
  infrastructures: {
    // Bâtiments administratifs et opérationnels
    quartierGeneral: { type: Boolean, default: false },
    casernes: { type: Number, default: 0 },
    dortoirs: { type: Number, default: 0 },
    bureauxAdministratifs: { type: Number, default: 0 },
    centreOperationnel: { type: Boolean, default: false },
    salleCommandement: { type: Boolean, default: false },
    salleBriefing: { type: Number, default: 0 },
    salleCrise: { type: Boolean, default: false },
    // Technologie
    centreInformatique: { type: Boolean, default: false },
    centreTelecommunications: { type: Boolean, default: false },
    // Armement & logistique
    depotsAmmunitions: { type: Number, default: 0 },
    armurerie: { type: Boolean, default: false },
    hangars: { type: Number, default: 0 },
    garages: { type: Number, default: 0 },
    ateliersMaintenance: { type: Number, default: 0 },
    reservoirsCarburant: { type: Number, default: 0 },
    entrepotsLogistiques: { type: Number, default: 0 },
    // Transport aérien/naval
    heliport: { type: Boolean, default: false },
    pisteAerienne: { type: Boolean, default: false },
    portMilitaire: { type: Boolean, default: false },
    // Services
    infirmerieHopital: { type: Boolean, default: false },
    refectoire: { type: Boolean, default: false },
    cuisine: { type: Boolean, default: false },
    centreSportif: { type: Boolean, default: false },
    terrainEntrainement: { type: Boolean, default: false },
    piscine: { type: Boolean, default: false },
  },

  // Stocks opérationnels
  stocks: {
    carburantLitres: { type: Number, default: 0 },
    vivresJours: { type: Number, default: 0 },
    munitionsStatut: { type: String, enum: ['critique', 'bas', 'normal', 'eleve'], default: 'normal' },
    medicamentsStatut: { type: String, enum: ['critique', 'bas', 'normal', 'eleve'], default: 'normal' },
  },

  // Sécurité & surveillance
  securite: {
    cameras: { type: Number, default: 0 },
    biometrie: { type: Boolean, default: false },
    controleAcces: { type: Boolean, default: false },
    detectionIntrusion: { type: Boolean, default: false },
    geolocalisationGPS: { type: Boolean, default: false },
    geofencing: {
      actif: { type: Boolean, default: false },
      rayonMetres: { type: Number, default: 0 },
      alertesSortie: { type: Boolean, default: false },
    },
    alertesAutomatiques: { type: Boolean, default: false },
  },

  contact: {
    telephone: { type: String },
    radio: { type: String },
    email: { type: String },
    frequenceRadio: { type: String },
  },

  surface: { type: Number },
  anneeConstruction: { type: Number },
  notes: { type: String },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
});

BaseMilitaireSchema.virtual('effectifTotal').get(function () {
  const e = this.effectifActuel;
  return (e.officiers || 0) + (e.sousOfficiers || 0) + (e.soldats || 0) + (e.civilians || 0);
});

BaseMilitaireSchema.index({ type: 1 });
BaseMilitaireSchema.index({ force: 1 });
BaseMilitaireSchema.index({ zone: 1 });
BaseMilitaireSchema.index({ region: 1 });
BaseMilitaireSchema.index({ 'localisation.province': 1 });

module.exports = mongoose.model('BaseMilitaire', BaseMilitaireSchema);
