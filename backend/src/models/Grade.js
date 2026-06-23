const mongoose = require('mongoose');

const GradeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  nom: { type: String, required: true },
  abreviation: { type: String, required: true },
  categorie: {
    type: String,
    enum: ['officier_general', 'officier_superieur', 'officier_subalterne', 'sous_officier', 'soldat'],
    required: true,
  },
  niveauHierarchique: { type: Number, required: true, min: 1 },
  force: {
    type: String,
    enum: ['terrestre', 'aerienne', 'maritime', 'emg', 'tous'],
    default: 'tous',
  },
  salaireBase: { type: Number, default: 0 },
  indemniteCommandement: { type: Number, default: 0 },
  couleurInsigne: { type: String, default: '#FFD700' },
  description: { type: String },
  actif: { type: Boolean, default: true },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
});

GradeSchema.index({ niveauHierarchique: 1 });
GradeSchema.index({ categorie: 1 });
// code a déjà unique:true - index auto-créé

module.exports = mongoose.model('Grade', GradeSchema);
