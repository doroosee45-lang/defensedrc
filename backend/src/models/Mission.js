const mongoose = require('mongoose');

const MissionSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  nom: { type: String, required: true },
  type: {
    type: String,
    enum: ['patrouille', 'securisation', 'offensive', 'humanitaire', 'formation', 'reconnaissance', 'appui'],
    required: true,
  },
  statut: {
    type: String,
    enum: ['planifiee', 'en_cours', 'suspendue', 'terminee', 'annulee'],
    default: 'planifiee',
  },
  priorite: {
    type: String,
    enum: ['critique', 'haute', 'normale', 'basse'],
    default: 'normale',
  },
  classification: {
    type: String,
    enum: ['public', 'interne', 'confidentiel', 'secret', 'tres_secret'],
    default: 'confidentiel',
  },

  commandant: { type: mongoose.Schema.Types.ObjectId, ref: 'Militaire', required: true },
  unitesPrincipales: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Unite' }],
  personnelAssigne: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Militaire' }],

  dateDebut: { type: Date, required: true },
  dateFin: { type: Date },
  dateFinPrevue: { type: Date },

  zoneOperation: {
    nom: { type: String },
    province: { type: String },
    territoire: { type: String },
    coordonnees: [{
      lat: { type: Number },
      lng: { type: Number },
    }],
    rayon: { type: Number },
  },

  objectifs: [{ type: String }],
  description: { type: String },

  ressources: {
    vehicules: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Vehicule' }],
    equipements: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Equipement' }],
    budgetAlloue: { type: Number, default: 0 },
    budgetDepense: { type: Number, default: 0 },
  },

  resultats: {
    objectifsAtteints: { type: Number, default: 0 },
    objectifsTotaux: { type: Number, default: 0 },
    blesses: { type: Number, default: 0 },
    morts: { type: Number, default: 0 },
    prisonniersCaptures: { type: Number, default: 0 },
    armesRecuperees: { type: Number, default: 0 },
    rapport: { type: String },
  },

  rapportsFinal: { type: String },
  creePar: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
});

MissionSchema.virtual('dureeJours').get(function () {
  if (!this.dateDebut) return 0;
  const fin = this.dateFin || Date.now();
  return Math.ceil((fin - this.dateDebut) / (1000 * 60 * 60 * 24));
});

MissionSchema.index({ statut: 1 });
MissionSchema.index({ type: 1 });
MissionSchema.index({ commandant: 1 });
MissionSchema.index({ dateDebut: -1 });

module.exports = mongoose.model('Mission', MissionSchema);
