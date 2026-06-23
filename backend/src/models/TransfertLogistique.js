const mongoose = require('mongoose');

const TransfertLogistiqueSchema = new mongoose.Schema({
  numeroTransfert: { type: String, required: true, unique: true, uppercase: true },
  type: {
    type: String,
    enum: ['equipement', 'vehicule', 'munitions', 'materiel_medical', 'vivres', 'carburant', 'mixte'],
    required: true,
  },
  statut: {
    type: String,
    enum: ['preparation', 'validation_securite', 'approuve', 'en_transit', 'livre', 'alerte_deviation', 'annule'],
    default: 'preparation',
  },
  priorite: {
    type: String,
    enum: ['urgente', 'haute', 'normale', 'basse'],
    default: 'normale',
  },

  uniteExpeditrice: { type: mongoose.Schema.Types.ObjectId, ref: 'Unite', required: true },
  uniteDestinataire: { type: mongoose.Schema.Types.ObjectId, ref: 'Unite', required: true },
  baseDepart: { type: mongoose.Schema.Types.ObjectId, ref: 'BaseMilitaire' },
  baseArrivee: { type: mongoose.Schema.Types.ObjectId, ref: 'BaseMilitaire' },

  articles: [{
    equipement: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipement' },
    vehicule: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicule' },
    designation: { type: String, required: true },
    quantite: { type: Number, required: true },
    unite: { type: String, default: 'unité' },
    valeurUSD: { type: Number },
    notes: { type: String },
  }],

  responsableExpediteur: { type: mongoose.Schema.Types.ObjectId, ref: 'Militaire' },
  responsableRecepteur: { type: mongoose.Schema.Types.ObjectId, ref: 'Militaire' },
  escorte: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Militaire' }],
  vehiculeTransport: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicule' },

  dateDepart: { type: Date },
  dateLivraisonPrevue: { type: Date },
  dateLivraisonEffective: { type: Date },

  itineraire: [{
    ordre: { type: Number },
    localisation: { type: String },
    coordonnees: {
      lat: { type: Number },
      lng: { type: Number },
    },
    etape: { type: String },
    datePassage: { type: Date },
  }],

  positionActuelle: {
    lat: { type: Number },
    lng: { type: Number },
    derniereMAJ: { type: Date },
  },

  alerteDeviation: {
    active: { type: Boolean, default: false },
    description: { type: String },
    dateAlerte: { type: Date },
    coordonneesDeviation: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },

  validationSecurite: {
    valide: { type: Boolean, default: false },
    officierSecurite: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    dateValidation: { type: Date },
    observations: { type: String },
  },

  receptionConfirmee: {
    confirme: { type: Boolean, default: false },
    par: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: { type: Date },
    observations: { type: String },
  },

  documents: [{ type: String }],
  notes: { type: String },
  creePar: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, {
  timestamps: true,
});

TransfertLogistiqueSchema.index({ statut: 1 });
TransfertLogistiqueSchema.index({ uniteExpeditrice: 1 });
TransfertLogistiqueSchema.index({ uniteDestinataire: 1 });
TransfertLogistiqueSchema.index({ dateDepart: -1 });

module.exports = mongoose.model('TransfertLogistique', TransfertLogistiqueSchema);
