const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { generateTokenPair, verifyRefreshToken } = require('../utils/jwt.utils');
const { generateOTPSecret, verifyOTPToken, generateQRCodeURL, generateBackupCodes } = require('../utils/otp.utils');
const { sendSuccess, sendError, sendUnauthorized, sendCreated } = require('../utils/response.utils');

const MAX_ATTEMPTS = 5;
const LOCK_DURATION = 30 * 60 * 1000; // 30 min

// POST /auth/login
const login = async (req, res) => {
  const { matricule, password } = req.body;

  try {
    const user = await User.findOne({ matricule: matricule?.toUpperCase() })
      .select('+password +mfaSecret +mfaEnabled +refreshTokens +tentativesLogin +compteBloqueJusqu');

    if (!user) {
      return sendUnauthorized(res, 'Matricule ou mot de passe incorrect');
    }

    if (user.estBloqueé()) {
      const minutesRestantes = Math.ceil((user.compteBloqueJusqu - Date.now()) / 60000);
      return sendUnauthorized(res, `Compte bloqué. Réessayez dans ${minutesRestantes} minutes.`);
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      user.tentativesLogin = (user.tentativesLogin || 0) + 1;
      if (user.tentativesLogin >= MAX_ATTEMPTS) {
        user.compteBloqueJusqu = new Date(Date.now() + LOCK_DURATION);
        user.tentativesLogin = 0;
      }
      await user.save({ validateBeforeSave: false });

      await AuditLog.create({
        matricule: user.matricule,
        action: 'echec_login',
        module: 'auth',
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        statut: 'echec',
        niveauRisque: 'moyen',
      });

      return sendUnauthorized(res, 'Matricule ou mot de passe incorrect');
    }

    if (!user.actif) {
      return sendUnauthorized(res, 'Compte désactivé');
    }

    // Si MFA activé, demander le code OTP
    if (user.mfaEnabled) {
      const tempToken = require('jsonwebtoken').sign(
        { id: user._id, mfaPending: true },
        process.env.JWT_SECRET,
        { expiresIn: '5m' }
      );
      return sendSuccess(res, { mfaRequired: true, tempToken }, 'Code MFA requis');
    }

    // Login sans MFA
    user.tentativesLogin = 0;
    user.dernierLogin = new Date();
    const { accessToken, refreshToken } = generateTokenPair(user);
    user.refreshTokens = [...(user.refreshTokens || []).slice(-4), refreshToken];
    await user.save({ validateBeforeSave: false });

    await AuditLog.create({
      utilisateur: user._id,
      matricule: user.matricule,
      nomUtilisateur: `${user.prenom} ${user.nom}`,
      role: user.role,
      action: 'login',
      module: 'auth',
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      statut: 'succes',
    });

    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.mfaSecret;
    delete userResponse.refreshTokens;

    return sendSuccess(res, { accessToken, refreshToken, user: userResponse }, 'Connexion réussie');
  } catch (err) {
    console.error('[Auth] Login error:', err);
    return sendError(res, 'Erreur lors de la connexion');
  }
};

// POST /auth/verify-mfa
const verifyMFA = async (req, res) => {
  const { tempToken, otpCode } = req.body;

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);

    if (!decoded.mfaPending) {
      return sendUnauthorized(res, 'Token invalide');
    }

    const user = await User.findById(decoded.id)
      .select('+mfaSecret +mfaBackupCodes +refreshTokens');

    if (!user) return sendUnauthorized(res, 'Utilisateur introuvable');

    const isValid = verifyOTPToken(otpCode, user.mfaSecret);

    if (!isValid) {
      // Vérifier les backup codes
      const backupIndex = user.mfaBackupCodes?.indexOf(otpCode.toUpperCase());
      if (backupIndex === -1 || backupIndex === undefined) {
        return sendUnauthorized(res, 'Code MFA invalide');
      }
      user.mfaBackupCodes.splice(backupIndex, 1);
    }

    user.dernierLogin = new Date();
    const { accessToken, refreshToken } = generateTokenPair(user);
    user.refreshTokens = [...(user.refreshTokens || []).slice(-4), refreshToken];
    await user.save({ validateBeforeSave: false });

    await AuditLog.create({
      utilisateur: user._id,
      matricule: user.matricule,
      action: 'login',
      module: 'auth',
      description: 'Connexion MFA réussie',
      ip: req.ip,
      statut: 'succes',
    });

    const userResponse = user.toObject();
    delete userResponse.mfaSecret;
    delete userResponse.mfaBackupCodes;
    delete userResponse.refreshTokens;

    return sendSuccess(res, { accessToken, refreshToken, user: userResponse }, 'Authentification MFA réussie');
  } catch (err) {
    return sendUnauthorized(res, 'Token MFA expiré. Recommencez la connexion.');
  }
};

// POST /auth/refresh
const refreshToken = async (req, res) => {
  const { refreshToken: token } = req.body;

  if (!token) return sendUnauthorized(res, 'Refresh token manquant');

  try {
    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.id).select('+refreshTokens');

    if (!user || !user.refreshTokens?.includes(token)) {
      return sendUnauthorized(res, 'Refresh token invalide ou révoqué');
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokenPair(user);
    user.refreshTokens = user.refreshTokens.filter(t => t !== token);
    user.refreshTokens.push(newRefreshToken);
    await user.save({ validateBeforeSave: false });

    return sendSuccess(res, { accessToken, refreshToken: newRefreshToken }, 'Token renouvelé');
  } catch (err) {
    return sendUnauthorized(res, 'Refresh token expiré ou invalide');
  }
};

// POST /auth/logout
const logout = async (req, res) => {
  const { refreshToken: token } = req.body;

  try {
    if (token && req.user) {
      const user = await User.findById(req.user._id).select('+refreshTokens');
      if (user) {
        user.refreshTokens = (user.refreshTokens || []).filter(t => t !== token);
        await user.save({ validateBeforeSave: false });
      }
    }

    await AuditLog.create({
      utilisateur: req.user?._id,
      matricule: req.user?.matricule,
      action: 'logout',
      module: 'auth',
      ip: req.ip,
      statut: 'succes',
    });

    return sendSuccess(res, {}, 'Déconnexion réussie');
  } catch (err) {
    return sendError(res, 'Erreur lors de la déconnexion');
  }
};

// GET /auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('unite', 'nom code type')
      .populate('militaire', 'nom prenom grade');

    return sendSuccess(res, { user }, 'Profil récupéré');
  } catch (err) {
    return sendError(res, 'Erreur lors de la récupération du profil');
  }
};

// POST /auth/setup-mfa
const setupMFA = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+mfaSecret');
    const secret = generateOTPSecret();
    const qrCode = await generateQRCodeURL(secret, user.email || user.matricule);
    const backupCodes = generateBackupCodes();

    user.mfaSecret = secret;
    user.mfaBackupCodes = backupCodes;
    await user.save({ validateBeforeSave: false });

    return sendSuccess(res, { secret, qrCode, backupCodes }, 'Configuration MFA générée. Scannez le QR code.');
  } catch (err) {
    return sendError(res, 'Erreur configuration MFA');
  }
};

// POST /auth/enable-mfa
const enableMFA = async (req, res) => {
  const { otpCode } = req.body;

  try {
    const user = await User.findById(req.user._id).select('+mfaSecret');

    if (!user.mfaSecret) {
      return sendError(res, 'Configurez d\'abord le MFA via /setup-mfa', 400);
    }

    const isValid = verifyOTPToken(otpCode, user.mfaSecret);
    if (!isValid) return sendError(res, 'Code OTP invalide', 400);

    user.mfaEnabled = true;
    await user.save({ validateBeforeSave: false });

    return sendSuccess(res, {}, 'Authentification à deux facteurs activée');
  } catch (err) {
    return sendError(res, 'Erreur activation MFA');
  }
};

// PUT /auth/change-password
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) return sendError(res, 'Mot de passe actuel incorrect', 400);

    user.password = newPassword;
    await user.save();

    await AuditLog.create({
      utilisateur: user._id,
      matricule: user.matricule,
      action: 'modification',
      module: 'auth',
      description: 'Changement de mot de passe',
      ip: req.ip,
      statut: 'succes',
      niveauRisque: 'moyen',
    });

    return sendSuccess(res, {}, 'Mot de passe modifié avec succès');
  } catch (err) {
    return sendError(res, 'Erreur changement de mot de passe');
  }
};

module.exports = { login, verifyMFA, refreshToken, logout, getMe, setupMFA, enableMFA, changePassword };
