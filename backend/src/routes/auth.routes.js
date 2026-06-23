const router = require('express').Router();
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const {
  login, verifyMFA, refreshToken, logout,
  getMe, setupMFA, enableMFA, changePassword,
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

const authLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX || 10),
  message: { success: false, message: 'Trop de tentatives. Réessayez dans 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', authLimiter, [
  body('matricule').notEmpty().withMessage('Matricule requis'),
  body('password').notEmpty().withMessage('Mot de passe requis'),
], login);

router.post('/verify-mfa', authLimiter, [
  body('tempToken').notEmpty(),
  body('otpCode').isLength({ min: 6, max: 8 }),
], verifyMFA);

router.post('/refresh', refreshToken);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.post('/setup-mfa', protect, setupMFA);
router.post('/enable-mfa', protect, [body('otpCode').isLength({ min: 6, max: 6 })], enableMFA);
router.put('/change-password', protect, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 8 }).withMessage('Mot de passe: 8 caractères minimum'),
], changePassword);

module.exports = router;
