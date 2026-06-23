const router = require('express').Router();
const { protect } = require('../middleware/auth.middleware');
const { authorize, authorizeMinLevel } = require('../middleware/role.middleware');
const { geoScope } = require('../middleware/scope.middleware');
const { createCRUD } = require('../controllers/crud.controller');

// Models
const Grade = require('../models/Grade');
const Unite = require('../models/Unite');
const DossierDisciplinaire = require('../models/DossierDisciplinaire');
const Vehicule = require('../models/Vehicule');
const Equipement = require('../models/Equipement');
const TransfertLogistique = require('../models/TransfertLogistique');
const BaseMilitaire = require('../models/BaseMilitaire');
const ZoneMilitaire = require('../models/ZoneMilitaire');
const RegionMilitaire = require('../models/RegionMilitaire');
const CentreFormation = require('../models/CentreFormation');
const Document = require('../models/Document');

const MANAGERS = ['souverain', 'super_admin', 'admin_national', 'admin_zone', 'admin_region', 'admin_provincial', 'admin_territorial', 'admin_sectoriel', 'officier_commandant'];
const ADMINS = ['souverain', 'super_admin', 'admin_national'];
const ALL_ROLES = ['souverain', 'super_admin', 'admin_national', 'admin_zone', 'admin_region', 'admin_provincial', 'admin_territorial', 'admin_sectoriel', 'officier_commandant', 'utilisateur_operationnel'];


// ─── Routes Auth ─────────────────────────────────────────────────────────────
router.use('/auth', require('./auth.routes'));

// ─── Routes Personnel ─────────────────────────────────────────────────────────
router.use('/personnel', require('./personnel.routes'));

// ─── Routes Grades ────────────────────────────────────────────────────────────
const gradeCRUD = createCRUD(Grade, 'grades', { allowedFilters: ['categorie', 'force', 'actif'], searchFields: ['nom', 'code'] });
router.get('/grades', protect, gradeCRUD.getAll);
router.get('/grades/:id', protect, gradeCRUD.getOne);
router.post('/grades', protect, authorize(...ADMINS), gradeCRUD.create);
router.put('/grades/:id', protect, authorize(...ADMINS), gradeCRUD.update);
router.delete('/grades/:id', protect, authorize(...ADMINS), gradeCRUD.remove);

// ─── Routes Unités ────────────────────────────────────────────────────────────
const uniteCRUD = createCRUD(Unite, 'unites', {
  allowedFilters: ['type', 'force', 'statut'],
  populateFields: [{ path: 'commandant', select: 'nom prenom matricule' }],
  searchFields: ['nom', 'code', 'sigle'],
  scopeMapping: { province: 'localisation.province', territoire: 'localisation.territoire', secteur: 'localisation.secteur' },
});
router.get('/unites', protect, uniteCRUD.getAll);
router.get('/unites/:id', protect, uniteCRUD.getOne);
router.post('/unites', protect, authorize(...ADMINS), uniteCRUD.create);
router.put('/unites/:id', protect, authorize(...MANAGERS), uniteCRUD.update);
router.delete('/unites/:id', protect, authorize(...ADMINS), uniteCRUD.remove);

// ─── Routes Opérations ────────────────────────────────────────────────────────
const opCtrl = require('../controllers/operations.controller');
router.get('/operations', protect, opCtrl.getAll);
router.get('/operations/stats', protect, opCtrl.getStats);
router.get('/operations/:id', protect, opCtrl.getOne);
router.post('/operations', protect, authorize(...MANAGERS), opCtrl.create);
router.put('/operations/:id', protect, authorize(...MANAGERS), opCtrl.update);
router.delete('/operations/:id', protect, authorize(...ADMINS), opCtrl.remove);
router.patch('/operations/:id/statut', protect, authorize(...MANAGERS), opCtrl.updateStatut);
router.post('/operations/:id/assigner', protect, authorize(...MANAGERS), opCtrl.assignPersonnel);

// ─── Routes Présences ─────────────────────────────────────────────────────────
const presCtrl = require('../controllers/presences.controller');
router.get('/presences', protect, presCtrl.getAll);
router.get('/presences/stats', protect, presCtrl.getStats);
router.get('/presences/militaire/:militaireId', protect, presCtrl.getByMilitaire);
router.get('/presences/:id', protect, presCtrl.getOne);
router.post('/presences', protect, presCtrl.create);
router.put('/presences/:id', protect, authorize(...MANAGERS), presCtrl.update);
router.patch('/presences/:id/valider', protect, authorize(...MANAGERS), presCtrl.valider);
router.delete('/presences/:id', protect, authorize(...ADMINS), presCtrl.remove);

// ─── Routes Permissions ───────────────────────────────────────────────────────
const permCtrl = require('../controllers/permissions.controller');
router.get('/permissions', protect, permCtrl.getAll);
router.get('/permissions/militaire/:militaireId', protect, permCtrl.getByMilitaire);
router.get('/permissions/:id', protect, permCtrl.getOne);
router.post('/permissions', protect, permCtrl.create);
router.put('/permissions/:id', protect, permCtrl.update);
router.patch('/permissions/:id/approuver', protect, authorize(...MANAGERS), permCtrl.approuver);
router.delete('/permissions/:id', protect, authorize(...ADMINS), permCtrl.remove);

// ─── Routes Médical ───────────────────────────────────────────────────────────
const medCtrl = require('../controllers/medical.controller');
router.get('/medical', protect, medCtrl.getAll);
router.get('/medical/militaire/:militaireId', protect, medCtrl.getByMilitaire);
router.get('/medical/:id', protect, medCtrl.getOne);
router.post('/medical', protect, authorize(...MANAGERS), medCtrl.create);
router.put('/medical/:id', protect, authorize(...MANAGERS), medCtrl.update);
router.post('/medical/:id/vaccination', protect, authorize(...MANAGERS), medCtrl.addVaccination);
router.post('/medical/:id/consultation', protect, authorize(...MANAGERS), medCtrl.addConsultation);
router.patch('/medical/:id/aptitude', protect, authorize(...MANAGERS), medCtrl.updateAptitude);
router.delete('/medical/:id', protect, authorize(...ADMINS), medCtrl.remove);

// ─── Routes Disciplinaire ─────────────────────────────────────────────────────
const discCtrl = createCRUD(DossierDisciplinaire, 'disciplinaire', {
  allowedFilters: ['type', 'statut', 'categorie'],
  populateFields: [{ path: 'militaire', select: 'nom prenom matricule grade' }],
});
router.get('/disciplinaire', protect, discCtrl.getAll);
router.get('/disciplinaire/:id', protect, discCtrl.getOne);
router.post('/disciplinaire', protect, authorize(...MANAGERS), discCtrl.create);
router.put('/disciplinaire/:id', protect, authorize(...MANAGERS), discCtrl.update);
router.delete('/disciplinaire/:id', protect, authorize(...ADMINS), discCtrl.remove);

// ─── Routes Financier ─────────────────────────────────────────────────────────
const finCtrl = require('../controllers/financier.controller');
router.get('/financier', protect, finCtrl.getAll);
router.get('/financier/masse-salariale', protect, authorize(...MANAGERS), finCtrl.getMasseSalariale);
router.get('/financier/militaire/:militaireId', protect, finCtrl.getByMilitaire);
router.get('/financier/:id', protect, finCtrl.getOne);
router.post('/financier', protect, authorize(...MANAGERS), finCtrl.create);
router.put('/financier/:id', protect, authorize(...MANAGERS), finCtrl.update);
router.patch('/financier/:id/approuver', protect, authorize(...ADMINS), finCtrl.approuver);
router.patch('/financier/:id/payer', protect, authorize(...ADMINS), finCtrl.marquerPaye);
router.delete('/financier/:id', protect, authorize(...ADMINS), finCtrl.remove);

// ─── Routes Messagerie ────────────────────────────────────────────────────────
const msgCtrl = require('../controllers/messagerie.controller');
router.get('/messagerie/inbox', protect, msgCtrl.getInbox);
router.get('/messagerie/sent', protect, msgCtrl.getSent);
router.get('/messagerie/non-lus', protect, msgCtrl.getNonLus);
router.get('/messagerie/:id', protect, msgCtrl.getOne);
router.post('/messagerie', protect, msgCtrl.send);
router.patch('/messagerie/:id/archive', protect, msgCtrl.archive);
router.delete('/messagerie/:id', protect, msgCtrl.remove);

// ─── Routes Véhicules ─────────────────────────────────────────────────────────
const vehCtrl = createCRUD(Vehicule, 'vehicules', {
  allowedFilters: ['type', 'statut'],
  populateFields: [{ path: 'unite', select: 'nom code' }, { path: 'chauffeurAssigne', select: 'nom prenom matricule' }],
  searchFields: ['immatriculation', 'designation', 'marque'],
});
router.get('/vehicules', protect, vehCtrl.getAll);
router.get('/vehicules/:id', protect, vehCtrl.getOne);
router.post('/vehicules', protect, authorize(...MANAGERS), vehCtrl.create);
router.put('/vehicules/:id', protect, authorize(...MANAGERS), vehCtrl.update);
router.delete('/vehicules/:id', protect, authorize(...ADMINS), vehCtrl.remove);

// ─── Routes Équipements ───────────────────────────────────────────────────────
const eqCtrl = createCRUD(Equipement, 'equipements', {
  allowedFilters: ['type', 'statut', 'etat', 'categorie'],
  populateFields: [{ path: 'unite', select: 'nom code' }],
  searchFields: ['code', 'designation', 'marque'],
});
router.get('/equipements', protect, eqCtrl.getAll);
router.get('/equipements/:id', protect, eqCtrl.getOne);
router.post('/equipements', protect, authorize(...MANAGERS), eqCtrl.create);
router.put('/equipements/:id', protect, authorize(...MANAGERS), eqCtrl.update);
router.delete('/equipements/:id', protect, authorize(...ADMINS), eqCtrl.remove);

// ─── Routes Logistique ────────────────────────────────────────────────────────
const logCtrl = createCRUD(TransfertLogistique, 'logistique', {
  allowedFilters: ['statut', 'type', 'priorite'],
  populateFields: [
    { path: 'uniteExpeditrice', select: 'nom code' },
    { path: 'uniteDestinataire', select: 'nom code' },
  ],
  searchFields: ['numeroTransfert'],
});
router.get('/logistique', protect, logCtrl.getAll);
router.get('/logistique/:id', protect, logCtrl.getOne);
router.post('/logistique', protect, authorize(...MANAGERS), logCtrl.create);
router.put('/logistique/:id', protect, authorize(...MANAGERS), logCtrl.update);
router.delete('/logistique/:id', protect, authorize(...ADMINS), logCtrl.remove);

// ─── Routes Alertes ───────────────────────────────────────────────────────────
const alertCtrl = require('../controllers/alertes.controller');
router.get('/alertes', protect, alertCtrl.getAll);
router.get('/alertes/actives', protect, alertCtrl.getActives);
router.get('/alertes/stats', protect, alertCtrl.getStats);
router.get('/alertes/:id', protect, alertCtrl.getOne);
router.post('/alertes', protect, authorize(...MANAGERS), alertCtrl.create);
router.post('/alertes/diffuser', protect, authorize(...MANAGERS), alertCtrl.diffuser);
router.put('/alertes/:id', protect, authorize(...MANAGERS), alertCtrl.update);
router.patch('/alertes/:id/lue', protect, alertCtrl.marquerLue);
router.patch('/alertes/:id/traiter', protect, authorize(...MANAGERS), alertCtrl.traiter);
router.delete('/alertes/:id', protect, authorize(...ADMINS), alertCtrl.remove);

// ─── Routes Documents ─────────────────────────────────────────────────────────
const { uploadDocument: uploadDocMiddleware, handleUploadError: handleDocError } = require('../middleware/upload.middleware');
const docCtrl = createCRUD(Document, 'documents', {
  allowedFilters: ['type', 'classification', 'statut'],
  populateFields: [{ path: 'auteur', select: 'nom prenom matricule' }],
  searchFields: ['titre', 'numero', 'tags'],
});
router.get('/documents', protect, docCtrl.getAll);
router.get('/documents/:id', protect, docCtrl.getOne);
router.post('/documents', protect, docCtrl.create);
router.put('/documents/:id', protect, docCtrl.update);
router.delete('/documents/:id', protect, authorize(...ADMINS), docCtrl.remove);
router.post('/documents/:id/upload', protect,
  uploadDocMiddleware.single('fichier'), handleDocError,
  async (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, message: 'Aucun fichier' });
    const doc = await Document.findByIdAndUpdate(
      req.params.id,
      { $push: { fichiers: { nom: req.file.originalname, type: req.file.mimetype, taille: req.file.size, url: `/uploads/documents/${req.file.filename}` } } },
      { new: true }
    );
    res.json({ success: true, data: doc });
  }
);

// ─── Routes Zones Militaires ──────────────────────────────────────────────────
const zoneCRUD = createCRUD(ZoneMilitaire, 'zones_militaires', {
  allowedFilters: ['niveauAlerte', 'statutOperationnel', 'actif'],
  searchFields: ['nom', 'code', 'quartierGeneral'],
});
router.get('/zones-militaires', protect, zoneCRUD.getAll);
router.get('/zones-militaires/:id', protect, zoneCRUD.getOne);
router.post('/zones-militaires', protect, authorize(...ADMINS), zoneCRUD.create);
router.put('/zones-militaires/:id', protect, authorize(...ADMINS), zoneCRUD.update);
router.delete('/zones-militaires/:id', protect, authorize(...ADMINS), zoneCRUD.remove);

// ─── Routes Régions Militaires ────────────────────────────────────────────────
const regionCRUD = createCRUD(RegionMilitaire, 'regions_militaires', {
  allowedFilters: ['niveauAlerte', 'statut', 'actif'],
  populateFields: [{ path: 'zone', select: 'nom code' }],
  searchFields: ['nom', 'code', 'quartierGeneral'],
});
router.get('/regions-militaires', protect, regionCRUD.getAll);
router.get('/regions-militaires/:id', protect, regionCRUD.getOne);
router.post('/regions-militaires', protect, authorize(...ADMINS), regionCRUD.create);
router.put('/regions-militaires/:id', protect, authorize(...ADMINS), regionCRUD.update);
router.delete('/regions-militaires/:id', protect, authorize(...ADMINS), regionCRUD.remove);

// ─── Routes Centres de Formation ──────────────────────────────────────────────
const centreCRUD = createCRUD(CentreFormation, 'centres_formation', {
  allowedFilters: ['statut', 'force'],
  populateFields: [
    { path: 'zone', select: 'nom code' },
    { path: 'region', select: 'nom code' },
  ],
  searchFields: ['nom', 'code', 'ville'],
  scopeMapping: { province: 'province', territoire: 'ville', secteur: 'secteur' },
});
router.get('/centres-formation', protect, centreCRUD.getAll);
router.get('/centres-formation/:id', protect, centreCRUD.getOne);
router.post('/centres-formation', protect, authorize(...ADMINS), centreCRUD.create);
router.put('/centres-formation/:id', protect, authorize(...MANAGERS), centreCRUD.update);
router.delete('/centres-formation/:id', protect, authorize(...ADMINS), centreCRUD.remove);

// ─── Routes Bases Militaires ──────────────────────────────────────────────────
const baseCRUD = createCRUD(BaseMilitaire, 'bases', {
  allowedFilters: ['type', 'force', 'statut', 'niveauSecurite'],
  populateFields: [{ path: 'commandant', select: 'nom prenom matricule' }, { path: 'unite', select: 'nom code' }],
  searchFields: ['nom', 'code'],
  scopeMapping: { province: 'localisation.province', territoire: 'localisation.territoire', secteur: 'localisation.secteur' },
});
router.get('/bases', protect, baseCRUD.getAll);
router.get('/bases/:id', protect, baseCRUD.getOne);
router.post('/bases', protect, authorize(...ADMINS), baseCRUD.create);
router.put('/bases/:id', protect, authorize(...MANAGERS), baseCRUD.update);
router.delete('/bases/:id', protect, authorize(...ADMINS), baseCRUD.remove);

// ─── Routes Géolocalisation ───────────────────────────────────────────────────
const geoCtrl = require('../controllers/geolocalisation.controller');
router.get('/geolocalisation/all', protect, geoCtrl.getAllPositions);
router.get('/geolocalisation/personnel', protect, geoCtrl.getPersonnelPositions);
router.get('/geolocalisation/vehicules', protect, geoCtrl.getVehiclesPositions);
router.patch('/geolocalisation/personnel/:id', protect, geoCtrl.updatePersonnelPosition);
router.patch('/geolocalisation/vehicules/:id', protect, geoCtrl.updateVehiculePosition);

// ─── Routes Rapports ──────────────────────────────────────────────────────────
const rapCtrl = require('../controllers/rapports.controller');
router.get('/rapports/dashboard', protect, rapCtrl.getDashboard);
router.get('/rapports/personnel', protect, authorize(...MANAGERS), rapCtrl.getPersonnelReport);
router.get('/rapports/operations', protect, authorize(...MANAGERS), rapCtrl.getOperationsReport);
router.get('/rapports/financier', protect, authorize(...ADMINS), rapCtrl.getFinancierReport);

// ─── Routes Audit ─────────────────────────────────────────────────────────────
const auditCtrl = require('../controllers/audit.controller');
router.get('/audit', protect, authorize(...ADMINS), auditCtrl.getAll);
router.get('/audit/stats', protect, authorize(...ADMINS), auditCtrl.getStats);
router.get('/audit/user/:userId', protect, authorize(...ADMINS), auditCtrl.getByUser);

// ─── Routes Administration ────────────────────────────────────────────────────
const adminCtrl = require('../controllers/administration.controller');
router.get('/administration/users', protect, authorize(...ADMINS), adminCtrl.getAllUsers);
router.post('/administration/users', protect, authorize(...ADMINS), adminCtrl.createUser);
router.put('/administration/users/:id', protect, authorize(...ADMINS), adminCtrl.updateUser);
router.patch('/administration/users/:id/toggle', protect, authorize(...ADMINS), adminCtrl.toggleUser);
router.patch('/administration/users/:id/reset-password', protect, authorize(...ADMINS), adminCtrl.resetUserPassword);

module.exports = router;
