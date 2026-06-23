const jwt = require('jsonwebtoken');

const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '8h',
    issuer: 'MILSYS-RDC',
    audience: 'FARDC',
  });
};

const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
    issuer: 'MILSYS-RDC',
    audience: 'FARDC',
  });
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET, {
    issuer: 'MILSYS-RDC',
    audience: 'FARDC',
  });
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
    issuer: 'MILSYS-RDC',
    audience: 'FARDC',
  });
};

const generateTokenPair = (user) => {
  const payload = {
    id: user._id,
    matricule: user.matricule,
    role: user.role,
    unite: user.unite,
  };

  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken({ id: user._id }),
  };
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateTokenPair,
};
