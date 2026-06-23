const mongoose = require('mongoose');

const MilitaireSchema = new mongoose.Schema({
  matricule: {
    type: String,
    required: [true, 'Le matricule est requis'],
    unique: true,
    uppercase: true,
    trim: true,
  },

  // Identité
  nom: { type: String, required: true, trim: true },
  prenom: { type: String, required: true, trim: true },
  dateNaissance: { type: Date, required: true },
  lieuNaissance: { type: String },
  sexe: { type: String, enum: ['M', 'F'], default: 'M' },
  nationalite: { type: String, default: 'Congolaise' },
  situationFamiliale: {
    type: String,
    enum: ['celibataire', 'marie', 'divorce', 'veuf'],
    default: 'celibataire',
  },
  nombreEnfants: { type: Number, default: 0 },
  photo: { type: String, default: null },
  numeroCNI: { type: String },

  // Contact
  telephone: { type: String },
  email: { type: String },
  adresse: { type: String },
  province: { type: String },
  ville: { type: String },

  // Militaire
  grade: { type: mongoose.Schema.Types.ObjectId, ref: 'Grade', required: true },
  gradeNom: { type: String },
  unite: { type: mongoose.Schema.Types.ObjectId, ref: 'Unite', required: true },
  uniteNom: { type: String },
  fonction: { type: String },
  specialite: { type: String },
  force: {
    type: String,
    enum: ['terrestre', 'aerienne', 'maritime', 'emg'],
    required: true,
  },

  statut: {
    type: String,
    enum: ['actif', 'permission', 'mission', 'formation', 'hopital', 'desertion', 'retraite', 'deces', 'suspendu'],
    default: 'actif',
  },
  dateEngagement: { type: Date },
  datePromotion: { type: Date },
  anneesService: { type: Number, default: 0 },
  numeroSolde: { type: String },

  // Formation
  niveauEtude: { type: String },
  formationsMilitaires: [{
    intitule: { type: String },
    lieu: { type: String },
    dateDebut: { type: Date },
    dateFin: { type: Date },
    certificat: { type: String },
  }],
  langues: [{ type: String }],

  // Physique
  tailleM: { type: Number },
  poidKg: { type: Number },
  groupeSanguin: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },

  // Décorations
  decorations: [{
    nom: { type: String },
    date: { type: Date },
    motif: { type: String },
  }],

  // Biométrie
  biometrie: {
    empreintesEnregistrees: { type: Boolean, default: false },
    photoFaceEnregistree: { type: Boolean, default: false },
    dateEnregistrement: { type: Date },
  },

  // GPS
  positionGPS: {
    lat: { type: Number },
    lng: { type: Number },
    derniereMAJ: { type: Date },
    precision: { type: Number },
  },

  actif: { type: Boolean, default: true },
  notes: { type: String },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

MilitaireSchema.virtual('nomComplet').get(function () {
  return `${this.prenom} ${this.nom}`;
});

MilitaireSchema.virtual('age').get(function () {
  if (!this.dateNaissance) return null;
  return Math.floor((Date.now() - this.dateNaissance.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
});

MilitaireSchema.index({ nom: 1, prenom: 1 });
MilitaireSchema.index({ unite: 1 });
MilitaireSchema.index({ grade: 1 });
MilitaireSchema.index({ statut: 1 });
MilitaireSchema.index({ force: 1 });

module.exports = mongoose.model('Militaire', MilitaireSchema);
