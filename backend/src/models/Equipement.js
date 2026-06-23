const mongoose = require('mongoose');

const EquipementSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  designation: { type: String, required: true },
  type: {
    type: String,
    enum: ['arme', 'munition', 'drone', 'communication', 'protection', 'optique', 'medical', 'genie', 'electronique', 'autre'],
    required: true,
  },
  categorie: { type: String },
  marque: { type: String },
  modele: { type: String },
  numeroSerie: { type: String },
  calibre: { type: String },

  statut: {
    type: String,
    enum: ['disponible', 'assigne', 'maintenance', 'hors_service', 'perte', 'destrucion'],
    default: 'disponible',
  },
  etat: {
    type: String,
    enum: ['excellent', 'bon', 'moyen', 'mauvais', 'inutilisable'],
    default: 'bon',
  },

  quantite: { type: Number, default: 1 },
  quantiteDisponible: { type: Number, default: 1 },
  seuilAlerte: { type: Number, default: 10 },

  unite: { type: mongoose.Schema.Types.ObjectId, ref: 'Unite' },
  base: { type: mongoose.Schema.Types.ObjectId, ref: 'BaseMilitaire' },
  assigneA: { type: mongoose.Schema.Types.ObjectId, ref: 'Militaire' },

  dateAcquisition: { type: Date },
  dateExpiration: { type: Date },
  valeurUSD: { type: Number },
  fournisseur: { type: String },

  classification: {
    type: String,
    enum: ['non_classifie', 'confidentiel', 'secret', 'tres_secret'],
    default: 'non_classifie',
  },

  historiqueMaintenances: [{
    date: { type: Date },
    type: { type: String },
    description: { type: String },
    technicien: { type: String },
    cout: { type: Number },
  }],

  notes: { type: String },
}, {
  timestamps: true,
});

EquipementSchema.index({ type: 1 });
EquipementSchema.index({ statut: 1 });
EquipementSchema.index({ unite: 1 });

module.exports = mongoose.model('Equipement', EquipementSchema);
