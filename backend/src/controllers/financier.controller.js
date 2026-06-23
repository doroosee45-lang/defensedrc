const FicheFinanciere = require('../models/FicheFinanciere');
const { createCRUD } = require('./crud.controller');
const { sendSuccess, sendError, sendNotFound } = require('../utils/response.utils');
const AuditLog = require('../models/AuditLog');

const crud = createCRUD(FicheFinanciere, 'financier', {
  allowedFilters: ['statut', 'devise'],
  defaultSort: '-periode.annee -periode.mois',
  populateFields: [
    { path: 'militaire', select: 'nom prenom matricule grade unite' },
    { path: 'approuvePar', select: 'nom prenom' },
  ],
});

const getByMilitaire = async (req, res) => {
  try {
    const data = await FicheFinanciere.find({ militaire: req.params.militaireId })
      .sort({ 'periode.annee': -1, 'periode.mois': -1 })
      .lean();
    return sendSuccess(res, { data });
  } catch (err) {
    return sendError(res, err.message);
  }
};

const approuver = async (req, res) => {
  try {
    const fiche = await FicheFinanciere.findByIdAndUpdate(
      req.params.id,
      { statut: 'approuve', approuvePar: req.user._id, dateApprobation: new Date() },
      { new: true }
    );
    if (!fiche) return sendNotFound(res, 'Fiche financière introuvable');

    await AuditLog.create({
      utilisateur: req.user?._id,
      action: 'modification',
      module: 'financier',
      ressourceId: req.params.id,
      description: 'Fiche financière approuvée',
      ip: req.ip,
      niveauRisque: 'moyen',
    }).catch(() => {});

    return sendSuccess(res, { data: fiche }, 'Fiche approuvée');
  } catch (err) {
    return sendError(res, err.message);
  }
};

const marquerPaye = async (req, res) => {
  try {
    const fiche = await FicheFinanciere.findByIdAndUpdate(
      req.params.id,
      { statut: 'paye', paiement: req.body.paiement },
      { new: true }
    );
    if (!fiche) return sendNotFound(res, 'Fiche introuvable');
    return sendSuccess(res, { data: fiche }, 'Paiement enregistré');
  } catch (err) {
    return sendError(res, err.message);
  }
};

const getMasseSalariale = async (req, res) => {
  try {
    const { mois, annee } = req.query;
    const filter = {};
    if (mois) filter['periode.mois'] = parseInt(mois);
    if (annee) filter['periode.annee'] = parseInt(annee);

    const stats = await FicheFinanciere.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalBrut: { $sum: '$totalBrut' },
          totalNet: { $sum: '$totalNet' },
          totalDeductions: { $sum: '$totalDeductions' },
          count: { $sum: 1 },
        },
      },
    ]);

    return sendSuccess(res, { data: stats[0] || {} });
  } catch (err) {
    return sendError(res, err.message);
  }
};

module.exports = { ...crud, getByMilitaire, approuver, marquerPaye, getMasseSalariale };
