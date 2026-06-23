const mongoose = require('mongoose');

const PermissionSchema = new mongoose.Schema({
  militaire: { type: mongoose.Schema.Types.ObjectId, ref: 'Militaire', required: true },
  unite: { type: mongoose.Schema.Types.ObjectId, ref: 'Unite', required: true },
  type: {
    type: String,
    enum: ['annuelle', 'maladie', 'exceptionnelle', 'compensatoire', 'maternite', 'paternite', 'deces'],
    required: true,
  },
  statut: {
    type: String,
    enum: ['en_attente', 'approuvee', 'refusee', 'annulee', 'en_cours', 'terminee'],
    default: 'en_attente',
  },
  dateDebut: { type: Date, required: true },
  dateFin: { type: Date, required: true },
  nombreJours: { type: Number },
  motif: { type: String, required: true },
  justificatifs: [{ type: String }],
  adresseConge: { type: String },
  telephoneUrgence: { type: String },

  demandePar: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approuvePar: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  dateApprobation: { type: Date },
  commentaireApprobation: { type: String },

  remplacantDesigne: { type: mongoose.Schema.Types.ObjectId, ref: 'Militaire' },
}, {
  timestamps: true,
});

PermissionSchema.pre('save', function (next) {
  if (this.dateDebut && this.dateFin) {
    const diff = (this.dateFin - this.dateDebut) / (1000 * 60 * 60 * 24);
    this.nombreJours = Math.ceil(diff) + 1;
  }
  next();
});

PermissionSchema.index({ militaire: 1, dateDebut: -1 });
PermissionSchema.index({ statut: 1 });
PermissionSchema.index({ unite: 1 });

module.exports = mongoose.model('Permission', PermissionSchema);
