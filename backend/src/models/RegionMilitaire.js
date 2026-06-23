const mongoose = require('mongoose');

const RegionMilitaireSchema = new mongoose.Schema({
  numero: { type: Number, required: true, unique: true },  // 11, 12, 13, 14, 21, 22, 31, 32, 33, 34
  code: { type: String, required: true, unique: true, uppercase: true },
  nom: { type: String, required: true },
  zone: { type: mongoose.Schema.Types.ObjectId, ref: 'ZoneMilitaire', required: true },
  quartierGeneral: { type: String },

  // Provinces couvertes
  provinces: [{ type: String }],

  // Commandement de région
  commandantRegional: { type: mongoose.Schema.Types.ObjectId, ref: 'Militaire' },
  commandantAdjoint: { type: mongoose.Schema.Types.ObjectId, ref: 'Militaire' },
  chefOperations: { type: mongoose.Schema.Types.ObjectId, ref: 'Militaire' },
  chefLogistique: { type: mongoose.Schema.Types.ObjectId, ref: 'Militaire' },
  chefRenseignement: { type: mongoose.Schema.Types.ObjectId, ref: 'Militaire' },

  // Statistiques opérationnelles
  statistiques: {
    militaires: { type: Number, default: 0 },
    unites: { type: Number, default: 0 },
    bases: { type: Number, default: 0 },
    casernes: { type: Number, default: 0 },
    vehicules: { type: Number, default: 0 },
    armes: { type: Number, default: 0 },
    munitionsStatut: { type: String, enum: ['critique', 'bas', 'normal', 'eleve'], default: 'normal' },
    aeronefs: { type: Number, default: 0 },
    navires: { type: Number, default: 0 },
  },

  niveauAlerte: {
    type: String,
    enum: ['normal', 'vigilance', 'alerte', 'urgence'],
    default: 'normal',
  },
  statut: {
    type: String,
    enum: ['active', 'alerte', 'engagee', 'interne'],
    default: 'active',
  },

  localisation: {
    province: { type: String },
    coordonnees: { lat: { type: Number }, lng: { type: Number } },
  },

  contact: {
    telephone: { type: String },
    radio: { type: String },
    email: { type: String },
  },

  description: { type: String },
  actif: { type: Boolean, default: true },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
});

RegionMilitaireSchema.index({ zone: 1 });
RegionMilitaireSchema.index({ provinces: 1 });

module.exports = mongoose.model('RegionMilitaire', RegionMilitaireSchema);
