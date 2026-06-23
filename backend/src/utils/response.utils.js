const sendSuccess = (res, data, message = 'Succès', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...data,
  });
};

const sendError = (res, message = 'Erreur serveur', statusCode = 500, errors = null) => {
  const response = { success: false, message };
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};

const sendCreated = (res, data, message = 'Créé avec succès') => {
  return sendSuccess(res, data, message, 201);
};

const sendNotFound = (res, message = 'Ressource non trouvée') => {
  return sendError(res, message, 404);
};

const sendUnauthorized = (res, message = 'Non autorisé') => {
  return sendError(res, message, 401);
};

const sendForbidden = (res, message = 'Accès interdit') => {
  return sendError(res, message, 403);
};

const sendValidationError = (res, errors) => {
  return sendError(res, 'Erreur de validation', 422, errors);
};

module.exports = {
  sendSuccess,
  sendError,
  sendCreated,
  sendNotFound,
  sendUnauthorized,
  sendForbidden,
  sendValidationError,
};
