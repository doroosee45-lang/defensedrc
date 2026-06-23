const { verifyAccessToken } = require('../utils/jwt.utils');
const User = require('../models/User');
const { sendUnauthorized } = require('../utils/response.utils');
const { buildGeoScope } = require('./scope.middleware');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return sendUnauthorized(res, 'Accès refusé. Token manquant.');
    }

    const decoded = verifyAccessToken(token);

    const user = await User.findById(decoded.id).select('-password -mfaSecret -mfaBackupCodes -refreshTokens');

    if (!user) {
      return sendUnauthorized(res, 'Utilisateur introuvable.');
    }

    if (!user.actif) {
      return sendUnauthorized(res, 'Compte désactivé. Contactez l\'administrateur.');
    }

    if (user.estBloqueé()) {
      return sendUnauthorized(res, `Compte temporairement bloqué jusqu'au ${user.compteBloqueJusqu.toLocaleString()}.`);
    }

    req.user = user;
    // Périmètre géographique calculé une seule fois après authentification
    req.geoScope = buildGeoScope(user);
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendUnauthorized(res, 'Session expirée. Veuillez vous reconnecter.');
    }
    if (error.name === 'JsonWebTokenError') {
      return sendUnauthorized(res, 'Token invalide.');
    }
    return sendUnauthorized(res, 'Erreur d\'authentification.');
  }
};

module.exports = { protect };
