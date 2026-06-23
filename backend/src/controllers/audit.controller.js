const AuditLog = require('../models/AuditLog');
const { paginate, paginateResponse, buildFilter } = require('../utils/pagination.utils');
const { sendSuccess, sendError } = require('../utils/response.utils');

const getAll = async (req, res) => {
  try {
    const { skip, limit, sort, page } = paginate(req.query, { ...req.query, sort: '-createdAt' });
    const filter = buildFilter(req.query, ['action', 'module', 'statut', 'niveauRisque']);

    if (req.query.utilisateur) filter.utilisateur = req.query.utilisateur;
    if (req.query.dateDebut || req.query.dateFin) {
      filter.createdAt = {};
      if (req.query.dateDebut) filter.createdAt.$gte = new Date(req.query.dateDebut);
      if (req.query.dateFin) filter.createdAt.$lte = new Date(req.query.dateFin);
    }

    const [data, total] = await Promise.all([
      AuditLog.find(filter)
        .populate('utilisateur', 'nom prenom matricule role')
        .sort(sort).skip(skip).limit(limit).lean(),
      AuditLog.countDocuments(filter),
    ]);

    return sendSuccess(res, paginateResponse(data, total, page, limit));
  } catch (err) {
    return sendError(res, err.message);
  }
};

const getStats = async (req, res) => {
  try {
    const [parAction, parModule, parNiveauRisque] = await Promise.all([
      AuditLog.aggregate([{ $group: { _id: '$action', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      AuditLog.aggregate([{ $group: { _id: '$module', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      AuditLog.aggregate([{ $group: { _id: '$niveauRisque', count: { $sum: 1 } } }]),
    ]);

    const recentAlertes = await AuditLog.find({ niveauRisque: { $in: ['eleve', 'critique'] } })
      .sort('-createdAt').limit(10)
      .populate('utilisateur', 'nom prenom matricule').lean();

    return sendSuccess(res, { data: { parAction, parModule, parNiveauRisque, recentAlertes } });
  } catch (err) {
    return sendError(res, err.message);
  }
};

const getByUser = async (req, res) => {
  try {
    const { skip, limit, sort, page } = paginate(req.query, { ...req.query, sort: '-createdAt' });
    const [data, total] = await Promise.all([
      AuditLog.find({ utilisateur: req.params.userId }).sort(sort).skip(skip).limit(limit).lean(),
      AuditLog.countDocuments({ utilisateur: req.params.userId }),
    ]);
    return sendSuccess(res, paginateResponse(data, total, page, limit));
  } catch (err) {
    return sendError(res, err.message);
  }
};

module.exports = { getAll, getStats, getByUser };
