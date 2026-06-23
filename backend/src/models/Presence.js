const mongoose = require('mongoose');

const PresenceSchema = new mongoose.Schema({
  militaire: { type: mongoose.Schema.Types.ObjectId, ref: 'Militaire', required: true },
  unite: { type: mongoose.Schema.Types.ObjectId, ref: 'Unite', required: true },
  date: { type: Date, required: true },
  heureArrivee: { type: String },
  heureDepart: { type: String },
  statut: {
    type: String,
    enum: ['present', 'absent', 'retard', 'permission', 'mission', 'formation', 'maladie', 'conge'],
    required: true,
    default: 'present',
  },
  methode: {
    type: String,
    enum: ['biometrique', 'gps', 'manuel', 'badge'],
    default: 'manuel',
  },
  coordonneesGPS: {
    lat: { type: Number },
    lng: { type: Number },
    precision: { type: Number },
  },
  motifAbsence: { type: String },
  justificatif: { type: String },
  valide: { type: Boolean, default: false },
  valideePar: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  dateValidation: { type: Date },
  notes: { type: String },
  creePar: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, {
  timestamps: true,
});

PresenceSchema.index({ militaire: 1, date: -1 });
PresenceSchema.index({ unite: 1, date: -1 });
PresenceSchema.index({ date: -1 });
PresenceSchema.index({ statut: 1 });

module.exports = mongoose.model('Presence', PresenceSchema);
