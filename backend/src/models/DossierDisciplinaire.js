const mongoose = require('mongoose');

const DossierDisciplinaireSchema = new mongoose.Schema({
  militaire: { type: mongoose.Schema.Types.ObjectId, ref: 'Militaire', required: true },
  type: {
    type: String,
    enum: ['infraction', 'sanction', 'distinction', 'felicitation', 'avertissement'],
    required: true,
  },
  categorie: {
    type: String,
    enum: ['discipline', 'deontologie', 'operationnel', 'administratif', 'moral'],
  },
  statut: {
    type: String,
    enum: ['ouvert', 'en_instruction', 'clos', 'appel', 'archive'],
    default: 'ouvert',
  },
  date: { type: Date, required: true },
  description: { type: String, required: true },
  faitsReproches: { type: String },
  infraction: { type: String },

  sanction: {
    type: { type: String, enum: ['avertissement', 'blame', 'arrets', 'suspension', 'retrogradation', 'radiation', 'detention'] },
    dureeJours: { type: Number },
    montantAmende: { type: Number },
    dateDebut: { type: Date },
    dateFin: { type: Date },
    executee: { type: Boolean, default: false },
  },

  distinction: {
    type: { type: String, enum: ['citation', 'felicitation', 'decoration', 'promotion_exceptionnelle'] },
    intitule: { type: String },
    motif: { type: String },
  },

  temoins: [{ type: String }],
  piecesJustificatives: [{ type: String }],
  rapport: { type: String },

  instructeurDossier: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  decisionnaire: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  dateDecision: { type: Date },
  motifDecision: { type: String },

  appel: {
    depose: { type: Boolean, default: false },
    dateDepot: { type: Date },
    resultat: { type: String },
  },

  creePar: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, {
  timestamps: true,
});

DossierDisciplinaireSchema.index({ militaire: 1, date: -1 });
DossierDisciplinaireSchema.index({ statut: 1 });
DossierDisciplinaireSchema.index({ type: 1 });

module.exports = mongoose.model('DossierDisciplinaire', DossierDisciplinaireSchema);
