const mongoose = require('mongoose');

const VehiculeSchema = new mongoose.Schema({
  immatriculation: { type: String, required: true, unique: true, uppercase: true },
  designation: { type: String, required: true },
  type: {
    type: String,
    enum: ['blinde', 'camion', 'vehicule_commandement', 'bateau', 'drone', 'ambulance', 'moto', 'avion', 'helicoptere', 'autre'],
    required: true,
  },
  marque: { type: String },
  modele: { type: String },
  annee: { type: Number },
  numeroSerie: { type: String },

  statut: {
    type: String,
    enum: ['disponible', 'en_mission', 'maintenance', 'hors_service', 'transfert', 'perte'],
    default: 'disponible',
  },

  unite: { type: mongoose.Schema.Types.ObjectId, ref: 'Unite' },
  base: { type: mongoose.Schema.Types.ObjectId, ref: 'BaseMilitaire' },
  chauffeurAssigne: { type: mongoose.Schema.Types.ObjectId, ref: 'Militaire' },

  caracteristiques: {
    capacitePersonnes: { type: Number },
    capaciteCargoKg: { type: Number },
    blindage: { type: String },
    armement: { type: String },
    porteeKm: { type: Number },
    vitesseMaxKmh: { type: Number },
  },

  kilometrage: { type: Number, default: 0 },
  niveauCarburant: { type: Number, min: 0, max: 100, default: 100 },
  prochaineMaintenance: { type: Date },
  derniereMaintenance: { type: Date },

  historiqueMaintenances: [{
    date: { type: Date },
    type: { type: String },
    description: { type: String },
    cout: { type: Number },
    technicien: { type: String },
  }],

  positionGPS: {
    lat: { type: Number },
    lng: { type: Number },
    vitesse: { type: Number },
    direction: { type: Number },
    derniereMAJ: { type: Date },
  },

  historiquePositions: [{
    lat: { type: Number },
    lng: { type: Number },
    timestamp: { type: Date },
    vitesse: { type: Number },
  }],

  assurance: {
    numero: { type: String },
    compagnie: { type: String },
    dateExpiration: { type: Date },
  },

  valeurUSD: { type: Number },
  notes: { type: String },
}, {
  timestamps: true,
});

VehiculeSchema.index({ statut: 1 });
VehiculeSchema.index({ unite: 1 });
VehiculeSchema.index({ type: 1 });

module.exports = mongoose.model('Vehicule', VehiculeSchema);
