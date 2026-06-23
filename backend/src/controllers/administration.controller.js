const User = require('../models/User');
const { paginate, paginateResponse, buildFilter } = require('../utils/pagination.utils');
const { sendSuccess, sendError, sendCreated, sendNotFound } = require('../utils/response.utils');
const AuditLog = require('../models/AuditLog');

const getAllUsers = async (req, res) => {
  try {
    const { skip, limit, sort, page } = paginate(req.query, { ...req.query, sort: '-createdAt' });
    const filter = buildFilter(req.query, ['role', 'actif']);

    if (req.query.search) {
      const re = new RegExp(req.query.search, 'i');
      filter.$or = [{ nom: re }, { prenom: re }, { matricule: re }];
    }

    const [data, total] = await Promise.all([
      User.find(filter)
        .populate('unite', 'nom code')
        .sort(sort).skip(skip).limit(limit).lean(),
      User.countDocuments(filter),
    ]);

    return sendSuccess(res, paginateResponse(data, total, page, limit));
  } catch (err) {
    return sendError(res, err.message);
  }
};

const createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);

    await AuditLog.create({
      utilisateur: req.user._id,
      action: 'creation',
      module: 'administration',
      ressourceId: user._id,
      description: `Création utilisateur ${user.matricule}`,
      ip: req.ip,
      niveauRisque: 'moyen',
    });

    const userResponse = user.toObject();
    delete userResponse.password;

    return sendCreated(res, { data: userResponse }, 'Utilisateur créé');
  } catch (err) {
    if (err.code === 11000) return sendError(res, 'Ce matricule ou email existe déjà', 409);
    return sendError(res, err.message, 422);
  }
};

const updateUser = async (req, res) => {
  try {
    // Ne pas permettre la modification du mot de passe ici
    delete req.body.password;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('unite', 'nom code');

    if (!user) return sendNotFound(res, 'Utilisateur introuvable');

    await AuditLog.create({
      utilisateur: req.user._id,
      action: 'modification',
      module: 'administration',
      ressourceId: req.params.id,
      ip: req.ip,
      niveauRisque: 'moyen',
    });

    return sendSuccess(res, { data: user }, 'Utilisateur mis à jour');
  } catch (err) {
    return sendError(res, err.message, 422);
  }
};

const toggleUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return sendNotFound(res, 'Utilisateur introuvable');

    user.actif = !user.actif;
    await user.save({ validateBeforeSave: false });

    await AuditLog.create({
      utilisateur: req.user._id,
      action: 'modification',
      module: 'administration',
      ressourceId: req.params.id,
      description: `Utilisateur ${user.actif ? 'activé' : 'désactivé'}`,
      ip: req.ip,
      niveauRisque: 'eleve',
    });

    return sendSuccess(res, { data: { actif: user.actif } }, `Utilisateur ${user.actif ? 'activé' : 'désactivé'}`);
  } catch (err) {
    return sendError(res, err.message);
  }
};

const resetUserPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return sendNotFound(res, 'Utilisateur introuvable');

    user.password = newPassword;
    user.tentativesLogin = 0;
    user.compteBloqueJusqu = null;
    await user.save();

    await AuditLog.create({
      utilisateur: req.user._id,
      action: 'modification',
      module: 'administration',
      ressourceId: req.params.id,
      description: `Réinitialisation mot de passe pour ${user.matricule}`,
      ip: req.ip,
      niveauRisque: 'eleve',
    });

    return sendSuccess(res, {}, 'Mot de passe réinitialisé');
  } catch (err) {
    return sendError(res, err.message);
  }
};

module.exports = { getAllUsers, createUser, updateUser, toggleUser, resetUserPassword };
