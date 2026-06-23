const mongoose = require('mongoose');

const FicheFinanciereSchema = new mongoose.Schema({
  militaire: { type: mongoose.Schema.Types.ObjectId, ref: 'Militaire', required: true },
  periode: {
    mois: { type: Number, required: true, min: 1, max: 12 },
    annee: { type: Number, required: true },
  },

  salaire: {
    base: { type: Number, default: 0 },
    indemniteGrade: { type: Number, default: 0 },
    indemniteCommandement: { type: Number, default: 0 },
    indemniteMission: { type: Number, default: 0 },
    indemnitePrime: { type: Number, default: 0 },
    indemniteRisque: { type: Number, default: 0 },
    indemniteFamille: { type: Number, default: 0 },
    indemniteFront: { type: Number, default: 0 },
    heuresSupp: { type: Number, default: 0 },
  },

  deductions: {
    impotRevenu: { type: Number, default: 0 },
    cnss: { type: Number, default: 0 },
    mutuelle: { type: Number, default: 0 },
    pret: { type: Number, default: 0 },
    avance: { type: Number, default: 0 },
    saisie: { type: Number, default: 0 },
    autre: { type: Number, default: 0 },
  },

  totalBrut: { type: Number, default: 0 },
  totalDeductions: { type: Number, default: 0 },
  totalNet: { type: Number, default: 0 },
  devise: { type: String, enum: ['CDF', 'USD'], default: 'USD' },

  statut: {
    type: String,
    enum: ['brouillon', 'soumis', 'approuve', 'paye', 'litige'],
    default: 'brouillon',
  },

  paiement: {
    mode: { type: String, enum: ['virement', 'especes', 'cheque', 'mobile_money'] },
    reference: { type: String },
    date: { type: Date },
    banque: { type: String },
    compte: { type: String },
  },

  presenceDuMois: {
    joursOuvres: { type: Number },
    joursPresents: { type: Number },
    joursAbsents: { type: Number },
    joursPermission: { type: Number },
    joursMission: { type: Number },
  },

  approuvePar: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  dateApprobation: { type: Date },
  creePar: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String },
}, {
  timestamps: true,
});

FicheFinanciereSchema.pre('save', function (next) {
  const s = this.salaire;
  this.totalBrut = (s.base || 0) + (s.indemniteGrade || 0) + (s.indemniteCommandement || 0) +
    (s.indemniteMission || 0) + (s.indemnitePrime || 0) + (s.indemniteRisque || 0) +
    (s.indemniteFamille || 0) + (s.indemniteFront || 0) + (s.heuresSupp || 0);

  const d = this.deductions;
  this.totalDeductions = (d.impotRevenu || 0) + (d.cnss || 0) + (d.mutuelle || 0) +
    (d.pret || 0) + (d.avance || 0) + (d.saisie || 0) + (d.autre || 0);

  this.totalNet = this.totalBrut - this.totalDeductions;
  next();
});

FicheFinanciereSchema.index({ militaire: 1, 'periode.annee': -1, 'periode.mois': -1 });
FicheFinanciereSchema.index({ statut: 1 });
FicheFinanciereSchema.index({ 'periode.annee': -1, 'periode.mois': -1 });

module.exports = mongoose.model('FicheFinanciere', FicheFinanciereSchema);
