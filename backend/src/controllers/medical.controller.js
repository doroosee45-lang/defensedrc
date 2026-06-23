const DossierMedical = require('../models/DossierMedical');
const { createCRUD } = require('./crud.controller');
const { sendSuccess, sendError, sendNotFound } = require('../utils/response.utils');

const crud = createCRUD(DossierMedical, 'medical', {
  allowedFilters: ['aptitudeMedicale'],
  populateFields: [
    { path: 'militaire', select: 'nom prenom matricule grade unite' },
    { path: 'miseAJourPar', select: 'nom prenom' },
  ],
});

const getByMilitaire = async (req, res) => {
  try {
    const dossier = await DossierMedical.findOne({ militaire: req.params.militaireId })
      .populate('militaire', 'nom prenom matricule grade unite')
      .lean();
    if (!dossier) return sendNotFound(res, 'Dossier médical introuvable');
    return sendSuccess(res, { data: dossier });
  } catch (err) {
    return sendError(res, err.message);
  }
};

const addVaccination = async (req, res) => {
  try {
    const dossier = await DossierMedical.findByIdAndUpdate(
      req.params.id,
      { $push: { vaccinations: req.body } },
      { new: true }
    );
    if (!dossier) return sendNotFound(res, 'Dossier introuvable');
    return sendSuccess(res, { data: dossier }, 'Vaccination ajoutée');
  } catch (err) {
    return sendError(res, err.message);
  }
};

const addConsultation = async (req, res) => {
  try {
    const dossier = await DossierMedical.findByIdAndUpdate(
      req.params.id,
      {
        $push: { consultations: req.body },
        derniereMiseAJour: new Date(),
        miseAJourPar: req.user._id,
      },
      { new: true }
    );
    if (!dossier) return sendNotFound(res, 'Dossier introuvable');
    return sendSuccess(res, { data: dossier }, 'Consultation enregistrée');
  } catch (err) {
    return sendError(res, err.message);
  }
};

const updateAptitude = async (req, res) => {
  try {
    const { aptitudeMedicale, dateVisiteMedicale, prochaineDateVisite, notes } = req.body;
    const dossier = await DossierMedical.findByIdAndUpdate(
      req.params.id,
      { aptitudeMedicale, dateVisiteMedicale, prochaineDateVisite, notes, derniereMiseAJour: new Date(), miseAJourPar: req.user._id },
      { new: true }
    );
    if (!dossier) return sendNotFound(res, 'Dossier introuvable');
    return sendSuccess(res, { data: dossier }, 'Aptitude mise à jour');
  } catch (err) {
    return sendError(res, err.message);
  }
};

module.exports = { ...crud, getByMilitaire, addVaccination, addConsultation, updateAptitude };
