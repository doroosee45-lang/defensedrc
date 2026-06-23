const Alerte = require('../models/Alerte');
const { createCRUD } = require('./crud.controller');
const { paginate, paginateResponse } = require('../utils/pagination.utils');
const { sendSuccess, sendError, sendNotFound } = require('../utils/response.utils');

const crud = createCRUD(Alerte, 'alertes', {
  allowedFilters: ['niveau', 'statut', 'type'],
  defaultSort: '-createdAt',
  populateFields: [
    { path: 'unitesConcernees', select: 'nom code' },
    { path: 'assigneeA', select: 'nom prenom' },
    { path: 'traitePar', select: 'nom prenom' },
  ],
});

const getActives = async (req, res) => {
  try {
    const filter = { statut: 'active' };
    if (req.query.niveau) filter.niveau = req.query.niveau;

    const alertes = await Alerte.find(filter)
      .sort({ niveau: -1, createdAt: -1 })
      .limit(50)
      .lean();

    return sendSuccess(res, { data: alertes });
  } catch (err) {
    return sendError(res, err.message);
  }
};

const marquerLue = async (req, res) => {
  try {
    const alerte = await Alerte.findByIdAndUpdate(
      req.params.id,
      {
        statut: 'lue',
        $push: { lectures: { utilisateur: req.user._id, date: new Date() } },
      },
      { new: true }
    );
    if (!alerte) return sendNotFound(res, 'Alerte introuvable');
    return sendSuccess(res, { data: alerte }, 'Alerte marquée comme lue');
  } catch (err) {
    return sendError(res, err.message);
  }
};

const traiter = async (req, res) => {
  try {
    const { actionsPrises } = req.body;
    const alerte = await Alerte.findByIdAndUpdate(
      req.params.id,
      {
        statut: 'traitee',
        traitePar: req.user._id,
        dateTraitement: new Date(),
        actionsPrises,
      },
      { new: true }
    );
    if (!alerte) return sendNotFound(res, 'Alerte introuvable');
    return sendSuccess(res, { data: alerte }, 'Alerte traitée');
  } catch (err) {
    return sendError(res, err.message);
  }
};

const diffuser = async (req, res) => {
  try {
    const alerte = await Alerte.create({
      ...req.body,
      creePar: req.user._id,
      typeDestinataire: 'broadcast',
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('nouvelle_alerte', {
        id: alerte._id,
        titre: alerte.titre,
        niveau: alerte.niveau,
        type: alerte.type,
      });
    }

    return require('../utils/response.utils').sendCreated(res, { data: alerte }, 'Alerte diffusée');
  } catch (err) {
    return sendError(res, err.message);
  }
};

const getStats = async (req, res) => {
  try {
    const [parNiveau, parType, parStatut] = await Promise.all([
      Alerte.aggregate([{ $group: { _id: '$niveau', count: { $sum: 1 } } }]),
      Alerte.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]),
      Alerte.aggregate([{ $group: { _id: '$statut', count: { $sum: 1 } } }]),
    ]);
    return sendSuccess(res, { data: { parNiveau, parType, parStatut } });
  } catch (err) {
    return sendError(res, err.message);
  }
};

module.exports = { ...crud, getActives, marquerLue, traiter, diffuser, getStats };
