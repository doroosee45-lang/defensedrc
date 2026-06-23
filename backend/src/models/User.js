const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  matricule: {
    type: String,
    required: [true, 'Le matricule est requis'],
    unique: true,
    uppercase: true,
    trim: true,
    match: [/^[A-Z0-9-]+$/, 'Matricule invalide'],
  },
  nom: { type: String, required: true, trim: true },
  prenom: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Email invalide'],
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: 8,
    select: false,
  },
  role: {
    type: String,
    enum: [
      'souverain',              // Présidence — accès total
      'super_admin',            // Admin système
      'admin_national',         // Ministère de la Défense
      'admin_zone',             // Zone Militaire
      'admin_region',           // Région Militaire
      'admin_provincial',       // Province
      'admin_territorial',      // Ville / Territoire
      'admin_sectoriel',        // Secteur
      'officier_commandant',    // Officier opérationnel
      'utilisateur_operationnel',
    ],
    default: 'utilisateur_operationnel',
  },
  grade: { type: String },
  unite: { type: mongoose.Schema.Types.ObjectId, ref: 'Unite' },
  militaire: { type: mongoose.Schema.Types.ObjectId, ref: 'Militaire' },
  photo: { type: String, default: null },

  // Périmètre géographique d'accès (null = accès global)
  scope: {
    zone: { type: String, default: null },             // ex: '1ere Zone Militaire'
    region: { type: String, default: null },           // ex: '34e Région Militaire'
    province: { type: String, default: null },
    territoire: { type: String, default: null },
    secteur: { type: String, default: null },
    // Références ObjectId pour les modèles liés
    zoneRef: { type: mongoose.Schema.Types.ObjectId, ref: 'ZoneMilitaire', default: null },
    regionRef: { type: mongoose.Schema.Types.ObjectId, ref: 'RegionMilitaire', default: null },
    perimetre: {
      type: String,
      enum: ['national', 'zone', 'regional', 'provincial', 'territorial', 'sectoriel', null],
      default: null,
    },
  },

  // MFA
  mfaSecret: { type: String, select: false },
  mfaEnabled: { type: Boolean, default: false },
  mfaBackupCodes: { type: [String], select: false },

  // Sécurité
  actif: { type: Boolean, default: true },
  dernierLogin: { type: Date },
  tentativesLogin: { type: Number, default: 0 },
  compteBloqueJusqu: { type: Date },
  refreshTokens: { type: [String], select: false },

  // Réinitialisation mot de passe
  resetPasswordToken: { type: String, select: false },
  resetPasswordExpire: { type: Date, select: false },

  permissions: {
    lecture: { type: Boolean, default: true },
    ecriture: { type: Boolean, default: false },
    suppression: { type: Boolean, default: false },
    export: { type: Boolean, default: false },
    impression: { type: Boolean, default: false },
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

UserSchema.virtual('nomComplet').get(function () {
  return `${this.grade || ''} ${this.prenom} ${this.nom}`.trim();
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.estBloqueé = function () {
  return this.compteBloqueJusqu && this.compteBloqueJusqu > Date.now();
};

UserSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

UserSchema.index({ role: 1 });
UserSchema.index({ unite: 1 });

module.exports = mongoose.model('User', UserSchema);
