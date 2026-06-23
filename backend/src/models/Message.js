const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  expediteur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  destinataires: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  destinatairesUnites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Unite' }],
  typeDestinataire: {
    type: String,
    enum: ['individuel', 'unite', 'broadcast'],
    default: 'individuel',
  },

  sujet: { type: String, required: true },
  contenu: { type: String, required: true },
  contenuChiffre: { type: Boolean, default: false },

  priorite: {
    type: String,
    enum: ['critique', 'haute', 'normale', 'basse'],
    default: 'normale',
  },
  type: {
    type: String,
    enum: ['operationnel', 'administratif', 'alerte', 'personnel', 'ordre'],
    default: 'administratif',
  },
  classification: {
    type: String,
    enum: ['non_classifie', 'confidentiel', 'secret', 'tres_secret'],
    default: 'confidentiel',
  },

  pieceJointes: [{
    nom: { type: String },
    type: { type: String },
    taille: { type: Number },
    url: { type: String },
  }],

  lu: [{
    utilisateur: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    dateLecture: { type: Date },
  }],

  repondA: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  conversation: { type: String },

  archive: { type: Boolean, default: false },
  supprime: { type: Boolean, default: false },
  dateExpiration: { type: Date },
}, {
  timestamps: true,
});

MessageSchema.index({ expediteur: 1 });
MessageSchema.index({ destinataires: 1 });
MessageSchema.index({ createdAt: -1 });
MessageSchema.index({ priorite: 1 });
MessageSchema.index({ conversation: 1 });

module.exports = mongoose.model('Message', MessageSchema);
