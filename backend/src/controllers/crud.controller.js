/**
 * Factory de contrôleurs CRUD génériques pour simplifier les modules
 */
const { paginate, paginateResponse, buildFilter } = require('../utils/pagination.utils');
const { sendSuccess, sendError, sendCreated, sendNotFound } = require('../utils/response.utils');
const AuditLog = require('../models/AuditLog');

const { applyScope } = require('../middleware/scope.middleware');

const createCRUD = (Model, moduleName, options = {}) => {
  const {
    allowedFilters = [],
    defaultSort = '-createdAt',
    populateFields = [],
    searchFields = [],
    scopeMapping = null, // ex: { province: 'province', territoire: 'ville' }
  } = options;

  const getAll = async (req, res) => {
    try {
      const { skip, limit, sort, page } = paginate(req.query, { ...req.query, sort: req.query.sort || defaultSort });
      let filter = buildFilter(req.query, allowedFilters);

      // Applique le filtre géographique si l'utilisateur a un périmètre restreint
      if (req.geoScope && scopeMapping) {
        filter = applyScope(filter, req.geoScope, scopeMapping);
      }

      if (searchFields.length && req.query.search) {
        const re = new RegExp(req.query.search, 'i');
        filter.$or = searchFields.map((f) => ({ [f]: re }));
      }

      let query = Model.find(filter).sort(sort).skip(skip).limit(limit);
      populateFields.forEach((p) => { query = query.populate(p); });
      const [data, total] = await Promise.all([query.lean(), Model.countDocuments(filter)]);

      return sendSuccess(res, paginateResponse(data, total, page, limit));
    } catch (err) {
      return sendError(res, err.message);
    }
  };

  const getOne = async (req, res) => {
    try {
      let query = Model.findById(req.params.id);
      populateFields.forEach((p) => { query = query.populate(p); });
      const doc = await query.lean();

      if (!doc) return sendNotFound(res, `${moduleName} introuvable`);

      await AuditLog.create({
        utilisateur: req.user?._id,
        action: 'consultation',
        module: moduleName,
        ressourceId: req.params.id,
        ip: req.ip,
      }).catch(() => {});

      return sendSuccess(res, { data: doc });
    } catch (err) {
      return sendError(res, err.message);
    }
  };

  const create = async (req, res) => {
    try {
      if (req.user) req.body.creePar = req.user._id;
      const doc = await Model.create(req.body);

      await AuditLog.create({
        utilisateur: req.user?._id,
        matricule: req.user?.matricule,
        action: 'creation',
        module: moduleName,
        ressourceId: doc._id,
        ip: req.ip,
      }).catch(() => {});

      return sendCreated(res, { data: doc });
    } catch (err) {
      if (err.code === 11000) return sendError(res, 'Cette entrée existe déjà (doublon)', 409);
      return sendError(res, err.message, 422);
    }
  };

  const update = async (req, res) => {
    try {
      const before = await Model.findById(req.params.id).lean();
      if (!before) return sendNotFound(res, `${moduleName} introuvable`);

      const doc = await Model.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true }
      );

      await AuditLog.create({
        utilisateur: req.user?._id,
        action: 'modification',
        module: moduleName,
        ressourceId: req.params.id,
        donneesBefore: before,
        donneesAfter: doc.toObject(),
        ip: req.ip,
      }).catch(() => {});

      return sendSuccess(res, { data: doc }, `${moduleName} mis à jour`);
    } catch (err) {
      return sendError(res, err.message, 422);
    }
  };

  const remove = async (req, res) => {
    try {
      const doc = await Model.findById(req.params.id);
      if (!doc) return sendNotFound(res, `${moduleName} introuvable`);

      await doc.deleteOne();

      await AuditLog.create({
        utilisateur: req.user?._id,
        action: 'suppression',
        module: moduleName,
        ressourceId: req.params.id,
        donneesBefore: doc.toObject(),
        ip: req.ip,
        niveauRisque: 'eleve',
      }).catch(() => {});

      return sendSuccess(res, {}, `${moduleName} supprimé`);
    } catch (err) {
      return sendError(res, err.message);
    }
  };

  return { getAll, getOne, create, update, remove };
};

module.exports = { createCRUD };
