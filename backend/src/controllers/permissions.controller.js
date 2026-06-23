const Permission = require('../models/Permission');
const { createCRUD } = require('./crud.controller');
const { sendSuccess, sendError, sendNotFound } = require('../utils/response.utils');
const AuditLog = require('../models/AuditLog');

const crud = createCRUD(Permission, 'permissions', {
  allowedFilters: ['statut', 'type'],
  defaultSort: '-createdAt',
  populateFields: [
    { path: 'militaire', select: 'nom prenom matricule grade unite' },
    { path: 'unite', select: 'nom code' },
    { path: 'approuvePar', select: 'nom prenom' },
    { path: 'remplacantDesigne', select: 'nom prenom matricule' },
  ],
});

const approuver = async (req, res) => {
  try {
    const { decision, commentaire } = req.body; // 'approuvee' | 'refusee'
    const permission = await Permission.findByIdAndUpdate(
      req.params.id,
      {
        statut: decision,
        approuvePar: req.user._id,
        dateApprobation: new Date(),
        commentaireApprobation: commentaire,
      },
      { new: true }
    ).populate('militaire', 'nom prenom matricule');

    if (!permission) return sendNotFound(res, 'Permission introuvable');

    await AuditLog.create({
      utilisateur: req.user?._id,
      action: 'modification',
      module: 'permissions',
      ressourceId: req.params.id,
      description: `Permission ${decision} pour ${permission.militaire?.matricule}`,
      ip: req.ip,
    }).catch(() => {});

    return sendSuccess(res, { data: permission }, `Permission ${decision}`);
  } catch (err) {
    return sendError(res, err.message);
  }
};

const getByMilitaire = async (req, res) => {
  try {
    const data = await Permission.find({ militaire: req.params.militaireId })
      .sort('-dateDebut')
      .lean();
    return sendSuccess(res, { data });
  } catch (err) {
    return sendError(res, err.message);
  }
};

module.exports = { ...crud, approuver, getByMilitaire };
