const { authenticator } = require('otplib');
const QRCode = require('qrcode');
const crypto = require('crypto');

authenticator.options = {
  window: parseInt(process.env.OTP_WINDOW) || 1,
  step: 30,
  digits: 6,
};

const generateOTPSecret = () => {
  return authenticator.generateSecret(20);
};

const generateOTPToken = (secret) => {
  return authenticator.generate(secret);
};

const verifyOTPToken = (token, secret) => {
  try {
    return authenticator.verify({ token, secret });
  } catch {
    return false;
  }
};

const generateQRCodeURL = async (secret, email, issuer) => {
  const otpAuthUrl = authenticator.keyuri(email, issuer || process.env.OTP_ISSUER || 'MILSYS-RDC', secret);
  return QRCode.toDataURL(otpAuthUrl);
};

const generateBackupCodes = () => {
  return Array.from({ length: 8 }, () =>
    crypto.randomBytes(4).toString('hex').toUpperCase()
  );
};

module.exports = {
  generateOTPSecret,
  generateOTPToken,
  verifyOTPToken,
  generateQRCodeURL,
  generateBackupCodes,
};
