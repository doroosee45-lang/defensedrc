const mongoose = require('mongoose');

const AlerteSchema = new mongoose.Schema({
  titre: { type: String, required: true },
  description: { type: String, required: true },
  type: {
    type: String,
    enum: ['securite', 'operationnel', 'logistique', 'medical', 'disciplinaire', 'administratif', 'systeme', 'geolocalisation'],
    required: true,
  },
  niveau: {
    type: String,
    enum: ['critique', 'haute', 'moyenne', 'basse', 'info'],
    required: true,
    default: 'moyenne',
  },
  statut: {
    type: String,
    enum: ['active', 'lue', 'traitee', 'fermee', 'ignoree'],
    default: 'active',
  },

  source: { type: String },
  module: { type: String },
  ressourceId: { type: String },
  ressourceType: { type: String },

  unitesConcernees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Unite' }],
  personnelConcerne: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Militaire' }],

  localisation: {
    province: { type: String },
    territoire: { type: String },
    coordonnees: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },

  lectures: [{
    utilisateur: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: { type: Date },
  }],

  assigneeA: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  traitePar: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  dateTraitement: { type: Date },
  actionsPrises: { type: String },

  expireA: { type: Date },
  recurrente: { type: Boolean, default: false },
  intervalleMinutes: { type: Number },

  metadata: { type: mongoose.Schema.Types.Mixed },
  creePar: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, {
  timestamps: true,
});

AlerteSchema.index({ niveau: 1 });
AlerteSchema.index({ statut: 1 });
AlerteSchema.index({ type: 1 });
AlerteSchema.index({ createdAt: -1 });
AlerteSchema.index({ unitesConcernees: 1 });

module.exports = mongoose.model('Alerte', AlerteSchema);
