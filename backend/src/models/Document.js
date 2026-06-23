const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  numero: { type: String, required: true, unique: true },
  titre: { type: String, required: true },
  type: {
    type: String,
    enum: ['ordre_operation', 'rapport', 'directive', 'circulaire', 'note_service', 'decision', 'arrete', 'protocole', 'contrat', 'autre'],
    required: true,
  },
  classification: {
    type: String,
    enum: ['non_classifie', 'diffusion_restreinte', 'confidentiel', 'secret', 'tres_secret'],
    default: 'confidentiel',
  },
  statut: {
    type: String,
    enum: ['brouillon', 'en_revision', 'approuve', 'publie', 'archive', 'perime'],
    default: 'brouillon',
  },

  auteur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  unite: { type: mongoose.Schema.Types.ObjectId, ref: 'Unite' },
  operation: { type: mongoose.Schema.Types.ObjectId, ref: 'Mission' },

  contenu: { type: String },
  fichiers: [{
    nom: { type: String },
    type: { type: String },
    taille: { type: Number },
    url: { type: String },
    checksum: { type: String },
    dateUpload: { type: Date, default: Date.now },
  }],

  version: { type: String, default: '1.0' },
  historique: [{
    version: { type: String },
    modifiePar: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: { type: Date },
    modifications: { type: String },
  }],

  destinataires: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Unite' }],
  destinatairesIndividuels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  accesLimite: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  dateDocument: { type: Date, default: Date.now },
  dateValidite: { type: Date },
  dateExpiration: { type: Date },

  approuvePar: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  dateApprobation: { type: Date },
  signatureNumerique: { type: String },

  tags: [{ type: String }],
  motsCles: [{ type: String }],
  nombreVues: { type: Number, default: 0 },
  telechargements: { type: Number, default: 0 },
}, {
  timestamps: true,
});

DocumentSchema.index({ type: 1 });
DocumentSchema.index({ classification: 1 });
DocumentSchema.index({ statut: 1 });
DocumentSchema.index({ auteur: 1 });
DocumentSchema.index({ tags: 1 });

module.exports = mongoose.model('Document', DocumentSchema);
