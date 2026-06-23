const Militaire = require('../models/Militaire');
const AuditLog = require('../models/AuditLog');
const { paginate, paginateResponse, buildFilter } = require('../utils/pagination.utils');
const { sendSuccess, sendError, sendCreated, sendNotFound } = require('../utils/response.utils');

// GET /personnel
const getAll = async (req, res) => {
  try {
    const { skip, limit, sort, page } = paginate(req.query, req.query);

    const filter = buildFilter(req.query, ['statut', 'force', 'sexe', 'situationFamiliale']);

    if (req.query.unite) filter.unite = req.query.unite;
    if (req.query.grade) filter.grade = req.query.grade;
    if (req.query.search) {
      const re = new RegExp(req.query.search, 'i');
      filter.$or = [{ nom: re }, { prenom: re }, { matricule: re }, { fonction: re }];
    }

    const [data, total] = await Promise.all([
      Militaire.find(filter)
        .populate('grade', 'nom abreviation categorie')
        .populate('unite', 'nom code type')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Militaire.countDocuments(filter),
    ]);

    return sendSuccess(res, paginateResponse(data, total, page, limit), 'Personnel récupéré');
  } catch (err) {
    return sendError(res, err.message);
  }
};

// GET /personnel/:id
const getOne = async (req, res) => {
  try {
    const militaire = await Militaire.findById(req.params.id)
      .populate('grade', 'nom abreviation categorie niveauHierarchique')
      .populate('unite', 'nom code type force localisation');

    if (!militaire) return sendNotFound(res, 'Militaire introuvable');

    await AuditLog.create({
      utilisateur: req.user?._id,
      action: 'consultation',
      module: 'personnel',
      ressourceId: req.params.id,
      ip: req.ip,
    });

    return sendSuccess(res, { data: militaire }, 'Militaire récupéré');
  } catch (err) {
    return sendError(res, err.message);
  }
};

// POST /personnel
const create = async (req, res) => {
  try {
    const militaire = await Militaire.create(req.body);

    await AuditLog.create({
      utilisateur: req.user?._id,
      matricule: req.user?.matricule,
      action: 'creation',
      module: 'personnel',
      ressourceId: militaire._id,
      description: `Création militaire ${militaire.matricule}`,
      ip: req.ip,
      statut: 'succes',
    });

    return sendCreated(res, { data: militaire }, 'Militaire créé avec succès');
  } catch (err) {
    if (err.code === 11000) return sendError(res, 'Ce matricule existe déjà', 409);
    return sendError(res, err.message, 422);
  }
};

// PUT /personnel/:id
const update = async (req, res) => {
  try {
    const before = await Militaire.findById(req.params.id).lean();
    if (!before) return sendNotFound(res, 'Militaire introuvable');

    const militaire = await Militaire.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('grade', 'nom').populate('unite', 'nom code');

    await AuditLog.create({
      utilisateur: req.user?._id,
      action: 'modification',
      module: 'personnel',
      ressourceId: req.params.id,
      donneesBefore: before,
      donneesAfter: militaire.toObject(),
      ip: req.ip,
    });

    return sendSuccess(res, { data: militaire }, 'Militaire mis à jour');
  } catch (err) {
    return sendError(res, err.message, 422);
  }
};

// DELETE /personnel/:id
const remove = async (req, res) => {
  try {
    const militaire = await Militaire.findById(req.params.id);
    if (!militaire) return sendNotFound(res, 'Militaire introuvable');

    await militaire.deleteOne();

    await AuditLog.create({
      utilisateur: req.user?._id,
      action: 'suppression',
      module: 'personnel',
      ressourceId: req.params.id,
      donneesBefore: militaire.toObject(),
      ip: req.ip,
      niveauRisque: 'eleve',
    });

    return sendSuccess(res, {}, 'Militaire supprimé');
  } catch (err) {
    return sendError(res, err.message);
  }
};

// POST /personnel/:id/photo
const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) return sendError(res, 'Aucun fichier envoyé', 400);

    const militaire = await Militaire.findByIdAndUpdate(
      req.params.id,
      { photo: `/uploads/photos/${req.file.filename}` },
      { new: true }
    );

    if (!militaire) return sendNotFound(res, 'Militaire introuvable');

    return sendSuccess(res, { photo: militaire.photo }, 'Photo mise à jour');
  } catch (err) {
    return sendError(res, err.message);
  }
};

// GET /personnel/stats
const getStats = async (req, res) => {
  try {
    const [
      total,
      parStatut,
      parForce,
      parSexe,
    ] = await Promise.all([
      Militaire.countDocuments({ actif: true }),
      Militaire.aggregate([{ $group: { _id: '$statut', count: { $sum: 1 } } }]),
      Militaire.aggregate([{ $group: { _id: '$force', count: { $sum: 1 } } }]),
      Militaire.aggregate([{ $group: { _id: '$sexe', count: { $sum: 1 } } }]),
    ]);

    return sendSuccess(res, {
      data: { total, parStatut, parForce, parSexe }
    }, 'Statistiques personnel');
  } catch (err) {
    return sendError(res, err.message);
  }
};

module.exports = { getAll, getOne, create, update, remove, uploadPhoto, getStats };
