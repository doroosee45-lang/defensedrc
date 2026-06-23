const Mission = require('../models/Mission');
const Militaire = require('../models/Militaire');
const { createCRUD } = require('./crud.controller');
const { paginate, paginateResponse, buildFilter } = require('../utils/pagination.utils');
const { sendSuccess, sendError, sendNotFound } = require('../utils/response.utils');
const AuditLog = require('../models/AuditLog');

const crud = createCRUD(Mission, 'operations', {
  allowedFilters: ['statut', 'type', 'priorite', 'classification'],
  defaultSort: '-dateDebut',
  populateFields: [
    { path: 'commandant', select: 'nom prenom grade matricule' },
    { path: 'unitesPrincipales', select: 'nom code type' },
  ],
  searchFields: ['nom', 'code', 'description'],
});

const getStats = async (req, res) => {
  try {
    const stats = await Mission.aggregate([
      {
        $group: {
          _id: '$statut',
          count: { $sum: 1 },
          personnel: { $sum: { $size: '$personnelAssigne' } },
        },
      },
    ]);
    const parType = await Mission.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]);
    return sendSuccess(res, { data: { parStatut: stats, parType } });
  } catch (err) {
    return sendError(res, err.message);
  }
};

const updateStatut = async (req, res) => {
  try {
    const { statut, notes } = req.body;
    const mission = await Mission.findByIdAndUpdate(
      req.params.id,
      { statut, ...(statut === 'terminee' ? { dateFin: new Date() } : {}) },
      { new: true }
    );
    if (!mission) return sendNotFound(res, 'Mission introuvable');

    await AuditLog.create({
      utilisateur: req.user?._id,
      action: 'modification',
      module: 'operations',
      ressourceId: req.params.id,
      description: `Statut mis à jour: ${statut}`,
      ip: req.ip,
    }).catch(() => {});

    // Mettre à jour le statut du personnel assigné si mission terminée
    if (statut === 'terminee' && mission.personnelAssigne?.length) {
      await Militaire.updateMany(
        { _id: { $in: mission.personnelAssigne }, statut: 'mission' },
        { statut: 'actif' }
      );
    }

    return sendSuccess(res, { data: mission }, 'Statut de la mission mis à jour');
  } catch (err) {
    return sendError(res, err.message);
  }
};

const assignPersonnel = async (req, res) => {
  try {
    const { personnelIds } = req.body;
    const mission = await Mission.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { personnelAssigne: { $each: personnelIds } } },
      { new: true }
    );
    if (!mission) return sendNotFound(res, 'Mission introuvable');

    await Militaire.updateMany(
      { _id: { $in: personnelIds } },
      { statut: 'mission' }
    );

    return sendSuccess(res, { data: mission }, 'Personnel assigné à la mission');
  } catch (err) {
    return sendError(res, err.message);
  }
};

module.exports = { ...crud, getStats, updateStatut, assignPersonnel };
