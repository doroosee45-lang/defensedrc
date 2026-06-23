const mongoose = require('mongoose');

const DossierMedicalSchema = new mongoose.Schema({
  militaire: { type: mongoose.Schema.Types.ObjectId, ref: 'Militaire', required: true, unique: true },
  groupeSanguin: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
  allergies: [{ type: String }],
  maladiesChroniques: [{ type: String }],
  traitementsCours: [{ type: String }],

  aptitudeMedicale: {
    type: String,
    enum: ['apte', 'apte_restrictions', 'inapte_temporaire', 'inapte_definitif'],
    default: 'apte',
  },
  dateVisiteMedicale: { type: Date },
  prochaineDateVisite: { type: Date },

  vaccinations: [{
    vaccin: { type: String, required: true },
    date: { type: Date, required: true },
    prochaineDose: { type: Date },
    lot: { type: String },
    administrePar: { type: String },
  }],

  antecedentsMedicaux: [{
    type: { type: String },
    description: { type: String },
    date: { type: Date },
    guerison: { type: Boolean, default: false },
  }],

  blessuresOperation: [{
    description: { type: String },
    date: { type: Date },
    operation: { type: mongoose.Schema.Types.ObjectId, ref: 'Mission' },
    severite: { type: String, enum: ['legere', 'moderee', 'grave', 'critique'] },
    traitement: { type: String },
    sequelles: { type: String },
  }],

  consultations: [{
    date: { type: Date },
    medecin: { type: String },
    motif: { type: String },
    diagnostic: { type: String },
    traitement: { type: String },
    suivi: { type: String },
  }],

  hospitalisations: [{
    etablissement: { type: String },
    dateEntree: { type: Date },
    dateSortie: { type: Date },
    motif: { type: String },
    diagnostic: { type: String },
  }],

  indiceSante: { type: Number, min: 0, max: 100, default: 100 },
  notes: { type: String },
  derniereMiseAJour: { type: Date, default: Date.now },
  miseAJourPar: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, {
  timestamps: true,
});

DossierMedicalSchema.index({ aptitudeMedicale: 1 });

module.exports = mongoose.model('DossierMedical', DossierMedicalSchema);
