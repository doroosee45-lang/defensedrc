const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Erreur serveur interne';

  // Mongoose - Document not found
  if (err.name === 'CastError') {
    message = `Ressource introuvable: ID invalide`;
    statusCode = 404;
  }

  // Mongoose - Duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    message = `La valeur '${value}' pour le champ '${field}' existe déjà`;
    statusCode = 409;
  }

  // Mongoose - Validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    message = 'Erreur de validation';
    statusCode = 422;
    return res.status(statusCode).json({ success: false, message, errors });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    message = 'Token invalide';
    statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    message = 'Token expiré';
    statusCode = 401;
  }

  // Log en développement
  if (process.env.NODE_ENV === 'development') {
    console.error('[ERROR]', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
};

module.exports = errorHandler;
