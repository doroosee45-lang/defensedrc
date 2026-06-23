const mongoose = require('mongoose');

const UniteSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  nom: { type: String, required: true },
  sigle: { type: String },
  type: {
    type: String,
    enum: ['emg', 'force', 'zone_defense', 'groupement', 'brigade', 'regiment', 'bataillon', 'compagnie', 'peloton', 'section', 'groupe', 'base'],
    required: true,
  },
  force: {
    type: String,
    enum: ['terrestre', 'aerienne', 'maritime', 'emg'],
    required: true,
  },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Unite', default: null },
  commandant: { type: mongoose.Schema.Types.ObjectId, ref: 'Militaire', default: null },

  localisation: {
    province: { type: String },
    territoire: { type: String },
    secteur: { type: String },
    coordonnees: {
      lat: { type: Number },
      lng: { type: Number },
    },
    adresse: { type: String },
  },

  effectifAutorise: { type: Number, default: 0 },
  effectifActuel: { type: Number, default: 0 },
  niveauAlerte: {
    type: String,
    enum: ['normal', 'vigilance', 'alerte', 'urgence'],
    default: 'normal',
  },
  statut: {
    type: String,
    enum: ['active', 'inactive', 'dissoute', 'en_formation'],
    default: 'active',
  },
  dateCreation: { type: Date },
  description: { type: String },
  contact: {
    telephone: { type: String },
    radio: { type: String },
    email: { type: String },
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
});

UniteSchema.virtual('sousUnites', {
  ref: 'Unite',
  localField: '_id',
  foreignField: 'parent',
});

UniteSchema.virtual('personnel', {
  ref: 'Militaire',
  localField: '_id',
  foreignField: 'unite',
});

UniteSchema.index({ parent: 1 });
UniteSchema.index({ type: 1 });
UniteSchema.index({ force: 1 });

module.exports = mongoose.model('Unite', UniteSchema);
