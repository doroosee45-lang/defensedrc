const mongoose = require('mongoose');

const ZoneMilitaireSchema = new mongoose.Schema({
  numero: { type: Number, required: true, unique: true, min: 1, max: 9 },
  code: { type: String, required: true, unique: true, uppercase: true },
  nom: { type: String, required: true },
  quartierGeneral: { type: String, required: true },

  // Commandement
  commandant: { type: mongoose.Schema.Types.ObjectId, ref: 'Militaire' },
  commandantAdjoint: { type: mongoose.Schema.Types.ObjectId, ref: 'Militaire' },
  chefEtatMajor: { type: mongoose.Schema.Types.ObjectId, ref: 'Militaire' },

  // Statistiques
  nombreRegions: { type: Number, default: 0 },
  nombreProvinces: { type: Number, default: 0 },
  nombreBases: { type: Number, default: 0 },
  nombreMilitaires: { type: Number, default: 0 },

  niveauAlerte: {
    type: String,
    enum: ['normal', 'vigilance', 'alerte', 'urgence'],
    default: 'normal',
  },
  statutOperationnel: {
    type: String,
    enum: ['operationnel', 'alerte', 'engage', 'releve'],
    default: 'operationnel',
  },

  localisation: {
    province: { type: String },
    coordonnees: { lat: { type: Number }, lng: { type: Number } },
  },

  contact: {
    telephone: { type: String },
    radio: { type: String },
    email: { type: String },
    frequenceRadio: { type: String },
  },

  description: { type: String },
  actif: { type: Boolean, default: true },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
});

ZoneMilitaireSchema.virtual('regions', {
  ref: 'RegionMilitaire',
  localField: '_id',
  foreignField: 'zone',
});

module.exports = mongoose.model('ZoneMilitaire', ZoneMilitaireSchema);
