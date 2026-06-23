const Militaire = require('../models/Militaire');
const Vehicule = require('../models/Vehicule');
const TransfertLogistique = require('../models/TransfertLogistique');
const { sendSuccess, sendError } = require('../utils/response.utils');

const getPersonnelPositions = async (req, res) => {
  try {
    const filter = {
      'positionGPS.lat': { $exists: true },
      'positionGPS.lng': { $exists: true },
      actif: true,
    };
    if (req.query.unite) filter.unite = req.query.unite;

    const personnel = await Militaire.find(filter)
      .select('nom prenom matricule gradeNom uniteNom statut positionGPS photo')
      .lean();

    return sendSuccess(res, { data: personnel });
  } catch (err) {
    return sendError(res, err.message);
  }
};

const getVehiclesPositions = async (req, res) => {
  try {
    const filter = {
      'positionGPS.lat': { $exists: true },
      'positionGPS.lng': { $exists: true },
    };
    if (req.query.statut) filter.statut = req.query.statut;

    const vehicules = await Vehicule.find(filter)
      .select('immatriculation designation type statut positionGPS uniteNom')
      .lean();

    return sendSuccess(res, { data: vehicules });
  } catch (err) {
    return sendError(res, err.message);
  }
};

const updatePersonnelPosition = async (req, res) => {
  try {
    const { lat, lng, precision } = req.body;
    const militaire = await Militaire.findByIdAndUpdate(
      req.params.id,
      { positionGPS: { lat, lng, precision, derniereMAJ: new Date() } },
      { new: true }
    );
    if (!militaire) return sendError(res, 'Militaire introuvable', 404);

    const io = req.app.get('io');
    if (io) {
      io.emit('position_update', { type: 'personnel', id: req.params.id, lat, lng });
    }

    return sendSuccess(res, { data: { lat, lng } }, 'Position mise à jour');
  } catch (err) {
    return sendError(res, err.message);
  }
};

const updateVehiculePosition = async (req, res) => {
  try {
    const { lat, lng, vitesse, direction } = req.body;
    const vehicule = await Vehicule.findByIdAndUpdate(
      req.params.id,
      {
        positionGPS: { lat, lng, vitesse, direction, derniereMAJ: new Date() },
        $push: {
          historiquePositions: {
            $each: [{ lat, lng, timestamp: new Date(), vitesse }],
            $slice: -100,
          },
        },
      },
      { new: true }
    );
    if (!vehicule) return sendError(res, 'Véhicule introuvable', 404);

    const io = req.app.get('io');
    if (io) {
      io.emit('position_update', { type: 'vehicule', id: req.params.id, lat, lng, vitesse });
    }

    return sendSuccess(res, { data: { lat, lng } }, 'Position véhicule mise à jour');
  } catch (err) {
    return sendError(res, err.message);
  }
};

const getAllPositions = async (req, res) => {
  try {
    const [personnel, vehicules, transferts] = await Promise.all([
      Militaire.find({ 'positionGPS.lat': { $exists: true }, actif: true })
        .select('nom prenom matricule gradeNom statut positionGPS')
        .lean(),
      Vehicule.find({ 'positionGPS.lat': { $exists: true } })
        .select('immatriculation designation type statut positionGPS')
        .lean(),
      TransfertLogistique.find({ statut: 'en_transit', 'positionActuelle.lat': { $exists: true } })
        .select('numeroTransfert type statut positionActuelle')
        .lean(),
    ]);

    return sendSuccess(res, { data: { personnel, vehicules, transferts } });
  } catch (err) {
    return sendError(res, err.message);
  }
};

module.exports = { getPersonnelPositions, getVehiclesPositions, updatePersonnelPosition, updateVehiculePosition, getAllPositions };
