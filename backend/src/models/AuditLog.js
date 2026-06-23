const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  utilisateur: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  matricule: { type: String },
  nomUtilisateur: { type: String },
  role: { type: String },

  action: {
    type: String,
    enum: ['consultation', 'creation', 'modification', 'suppression', 'export', 'import', 'login', 'logout', 'echec_login', 'tentative_acces', 'impression', 'telechargement'],
    required: true,
  },

  module: {
    type: String,
    enum: ['auth', 'personnel', 'grades', 'unites', 'operations', 'presences', 'permissions', 'medical', 'disciplinaire', 'financier', 'messagerie', 'documents', 'vehicules', 'equipements', 'logistique', 'alertes', 'rapports', 'bases', 'geolocalisation', 'administration', 'zones_militaires', 'regions_militaires', 'centres_formation'],
    required: true,
  },

  ressource: { type: String },
  ressourceId: { type: String },
  description: { type: String },

  ip: { type: String },
  userAgent: { type: String },
  methodeHTTP: { type: String },
  endpoint: { type: String },

  // Traçabilité enrichie
  gps: {
    lat: { type: Number },
    lng: { type: Number },
  },
  appareil: {
    type: { type: String },       // desktop, mobile, tablet
    os: { type: String },
    navigateur: { type: String },
    version: { type: String },
  },
  localisation: { type: String }, // ville/pays déduit de l'IP
  signatureNumerique: { type: String }, // SHA-256 de l'action
  scopeGeographique: { type: String }, // province/territoire/secteur de l'utilisateur

  donneesBefore: { type: mongoose.Schema.Types.Mixed },
  donneesAfter: { type: mongoose.Schema.Types.Mixed },

  statut: {
    type: String,
    enum: ['succes', 'echec', 'alerte'],
    default: 'succes',
  },
  codeErreur: { type: String },
  messageErreur: { type: String },

  niveauRisque: {
    type: String,
    enum: ['faible', 'moyen', 'eleve', 'critique'],
    default: 'faible',
  },
  dureeMs: { type: Number },
}, {
  timestamps: true,
});

AuditLogSchema.index({ utilisateur: 1 });
AuditLogSchema.index({ action: 1 });
AuditLogSchema.index({ module: 1 });
AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ statut: 1 });
AuditLogSchema.index({ niveauRisque: 1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
