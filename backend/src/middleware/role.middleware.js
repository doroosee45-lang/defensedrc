const { sendForbidden } = require('../utils/response.utils');

const ROLE_HIERARCHY = {
  souverain: 10,
  super_admin: 9,
  admin_national: 8,
  admin_zone: 7,
  admin_region: 6,
  admin_provincial: 5,
  admin_territorial: 4,
  admin_sectoriel: 3,
  officier_commandant: 2,
  utilisateur_operationnel: 1,
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendForbidden(res, 'Non authentifié.');
    }

    if (!roles.includes(req.user.role)) {
      return sendForbidden(res, `Rôle '${req.user.role}' non autorisé pour cette action.`);
    }

    next();
  };
};

const authorizeMinLevel = (minRole) => {
  return (req, res, next) => {
    if (!req.user) return sendForbidden(res, 'Non authentifié.');

    const userLevel = ROLE_HIERARCHY[req.user.role] || 0;
    const minLevel = ROLE_HIERARCHY[minRole] || 0;

    if (userLevel < minLevel) {
      return sendForbidden(res, 'Niveau d\'autorisation insuffisant.');
    }

    next();
  };
};

const checkPermission = (permissionType) => {
  return (req, res, next) => {
    if (!req.user) return sendForbidden(res, 'Non authentifié.');

    if (!req.user.permissions?.[permissionType]) {
      return sendForbidden(res, `Permission '${permissionType}' refusée.`);
    }

    next();
  };
};

module.exports = { authorize, authorizeMinLevel, checkPermission, ROLE_HIERARCHY };
