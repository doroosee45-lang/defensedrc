const Militaire = require('../models/Militaire');
const Mission = require('../models/Mission');
const Vehicule = require('../models/Vehicule');
const Equipement = require('../models/Equipement');
const Presence = require('../models/Presence');
const Alerte = require('../models/Alerte');
const FicheFinanciere = require('../models/FicheFinanciere');
const { sendSuccess, sendError } = require('../utils/response.utils');
const AuditLog = require('../models/AuditLog');

const getDashboard = async (req, res) => {
  try {
    const [
      totalPersonnel,
      personnelActif,
      personnelMission,
      personnelFormation,
      missionsActives,
      totalVehicules,
      vehiculesDisponibles,
      alertesActives,
      alertesCritiques,
    ] = await Promise.all([
      Militaire.countDocuments({ actif: true }),
      Militaire.countDocuments({ statut: 'actif', actif: true }),
      Militaire.countDocuments({ statut: 'mission', actif: true }),
      Militaire.countDocuments({ statut: 'formation', actif: true }),
      Mission.countDocuments({ statut: 'en_cours' }),
      Vehicule.countDocuments(),
      Vehicule.countDocuments({ statut: 'disponible' }),
      Alerte.countDocuments({ statut: 'active' }),
      Alerte.countDocuments({ statut: 'active', niveau: 'critique' }),
    ]);

    const parForce = await Militaire.aggregate([
      { $match: { actif: true } },
      { $group: { _id: '$force', count: { $sum: 1 } } },
    ]);

    const missionsParType = await Mission.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]);

    return sendSuccess(res, {
      data: {
        personnel: { total: totalPersonnel, actif: personnelActif, enMission: personnelMission, enFormation: personnelFormation, parForce },
        operations: { actives: missionsActives, parType: missionsParType },
        vehicules: { total: totalVehicules, disponibles: vehiculesDisponibles, tauxDisponibilite: totalVehicules ? Math.round((vehiculesDisponibles / totalVehicules) * 100) : 0 },
        alertes: { total: alertesActives, critiques: alertesCritiques },
      },
    }, 'Tableau de bord');
  } catch (err) {
    return sendError(res, err.message);
  }
};

const getPersonnelReport = async (req, res) => {
  try {
    const { annee = new Date().getFullYear() } = req.query;

    const [parGrade, parUnite, parStatut, parProvince] = await Promise.all([
      Militaire.aggregate([{ $group: { _id: '$gradeNom', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Militaire.aggregate([{ $group: { _id: '$uniteNom', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 20 }]),
      Militaire.aggregate([{ $group: { _id: '$statut', count: { $sum: 1 } } }]),
      Militaire.aggregate([{ $group: { _id: '$province', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    ]);

    await AuditLog.create({
      utilisateur: req.user?._id,
      action: 'export',
      module: 'rapports',
      description: `Rapport personnel ${annee}`,
      ip: req.ip,
      niveauRisque: 'moyen',
    }).catch(() => {});

    return sendSuccess(res, { data: { parGrade, parUnite, parStatut, parProvince } }, 'Rapport personnel');
  } catch (err) {
    return sendError(res, err.message);
  }
};

const getOperationsReport = async (req, res) => {
  try {
    const { annee = new Date().getFullYear() } = req.query;
    const debut = new Date(`${annee}-01-01`);
    const fin = new Date(`${annee}-12-31`);

    const missions = await Mission.aggregate([
      { $match: { dateDebut: { $gte: debut, $lte: fin } } },
      { $group: { _id: { statut: '$statut', type: '$type' }, count: { $sum: 1 } } },
    ]);

    const basCasualties = await Mission.aggregate([
      { $match: { dateDebut: { $gte: debut, $lte: fin } } },
      {
        $group: {
          _id: null,
          totalBlesses: { $sum: '$resultats.blesses' },
          totalMorts: { $sum: '$resultats.morts' },
          totalCaptured: { $sum: '$resultats.prisonniersCaptures' },
        },
      },
    ]);

    return sendSuccess(res, { data: { missions, victimes: basCasualties[0] || {} } });
  } catch (err) {
    return sendError(res, err.message);
  }
};

const getFinancierReport = async (req, res) => {
  try {
    const { annee = new Date().getFullYear() } = req.query;

    const masseSalariale = await FicheFinanciere.aggregate([
      { $match: { 'periode.annee': parseInt(annee) } },
      {
        $group: {
          _id: '$periode.mois',
          totalBrut: { $sum: '$totalBrut' },
          totalNet: { $sum: '$totalNet' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return sendSuccess(res, { data: { masseSalariale } });
  } catch (err) {
    return sendError(res, err.message);
  }
};

module.exports = { getDashboard, getPersonnelReport, getOperationsReport, getFinancierReport };
