const Presence = require('../models/Presence');
const { createCRUD } = require('./crud.controller');
const { paginate, paginateResponse } = require('../utils/pagination.utils');
const { sendSuccess, sendError, sendNotFound } = require('../utils/response.utils');

const crud = createCRUD(Presence, 'presences', {
  allowedFilters: ['statut', 'methode', 'valide'],
  defaultSort: '-date',
  populateFields: [
    { path: 'militaire', select: 'nom prenom matricule grade' },
    { path: 'unite', select: 'nom code' },
    { path: 'valideePar', select: 'nom prenom' },
  ],
});

const getByMilitaire = async (req, res) => {
  try {
    const { skip, limit, sort, page } = require('../utils/pagination.utils').paginate(req.query, req.query);
    const filter = { militaire: req.params.militaireId };
    if (req.query.dateDebut) filter.date = { $gte: new Date(req.query.dateDebut) };
    if (req.query.dateFin) filter.date = { ...filter.date, $lte: new Date(req.query.dateFin) };

    const [data, total] = await Promise.all([
      Presence.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      Presence.countDocuments(filter),
    ]);
    const { paginateResponse } = require('../utils/pagination.utils');
    return sendSuccess(res, paginateResponse(data, total, page, limit));
  } catch (err) {
    return sendError(res, err.message);
  }
};

const valider = async (req, res) => {
  try {
    const presence = await Presence.findByIdAndUpdate(
      req.params.id,
      { valide: true, valideePar: req.user._id, dateValidation: new Date() },
      { new: true }
    );
    if (!presence) return sendNotFound(res, 'Présence introuvable');
    return sendSuccess(res, { data: presence }, 'Présence validée');
  } catch (err) {
    return sendError(res, err.message);
  }
};

const getStats = async (req, res) => {
  try {
    const { unite, dateDebut, dateFin } = req.query;
    const filter = {};
    if (unite) filter.unite = unite;
    if (dateDebut || dateFin) {
      filter.date = {};
      if (dateDebut) filter.date.$gte = new Date(dateDebut);
      if (dateFin) filter.date.$lte = new Date(dateFin);
    }

    const stats = await Presence.aggregate([
      { $match: filter },
      { $group: { _id: '$statut', count: { $sum: 1 } } },
    ]);

    return sendSuccess(res, { data: stats });
  } catch (err) {
    return sendError(res, err.message);
  }
};

module.exports = { ...crud, getByMilitaire, valider, getStats };
