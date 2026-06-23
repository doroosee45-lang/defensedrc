const AuditLog = require('../models/AuditLog');

const RISKY_ACTIONS = ['suppression', 'export', 'telechargement'];
const CRITICAL_MODULES = ['auth', 'administration', 'financier'];

const auditLog = (action, module, options = {}) => {
  return async (req, res, next) => {
    const startTime = Date.now();
    const originalSend = res.json.bind(res);
    let responseBody = null;

    res.json = (body) => {
      responseBody = body;
      return originalSend(body);
    };

    res.on('finish', async () => {
      try {
        const dureeMs = Date.now() - startTime;
        const statut = res.statusCode < 400 ? 'succes' : 'echec';

        let niveauRisque = 'faible';
        if (RISKY_ACTIONS.includes(action)) niveauRisque = 'moyen';
        if (CRITICAL_MODULES.includes(module)) niveauRisque = 'eleve';
        if (action === 'suppression' && CRITICAL_MODULES.includes(module)) niveauRisque = 'critique';

        await AuditLog.create({
          utilisateur: req.user?._id,
          matricule: req.user?.matricule,
          nomUtilisateur: req.user ? `${req.user.prenom} ${req.user.nom}` : 'Anonyme',
          role: req.user?.role,
          action,
          module,
          ressource: options.ressource || req.baseUrl,
          ressourceId: req.params.id || options.ressourceId,
          description: options.description || `${action} sur ${module}`,
          ip: req.ip || req.connection?.remoteAddress,
          userAgent: req.headers?.['user-agent'],
          methodeHTTP: req.method,
          endpoint: req.originalUrl,
          statut,
          niveauRisque,
          dureeMs,
        });
      } catch (err) {
        // Ne pas bloquer la requête si l'audit échoue
        console.error('[Audit] Erreur:', err.message);
      }
    });

    next();
  };
};

module.exports = { auditLog };
