const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { sendError } = require('../utils/response.utils');

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_DOC_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg', 'image/png',
];

const createStorage = (destination) => multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), destination));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (allowedTypes) => (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Type de fichier non autorisé: ${file.mimetype}`), false);
  }
};

const uploadPhoto = multer({
  storage: createStorage('uploads/photos'),
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 },
  fileFilter: fileFilter(ALLOWED_IMAGE_TYPES),
});

const uploadDocument = multer({
  storage: createStorage('uploads/documents'),
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 },
  fileFilter: fileFilter(ALLOWED_DOC_TYPES),
});

const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return sendError(res, 'Fichier trop volumineux', 400);
    }
    return sendError(res, `Erreur upload: ${err.message}`, 400);
  }
  if (err) {
    return sendError(res, err.message, 400);
  }
  next();
};

module.exports = { uploadPhoto, uploadDocument, handleUploadError };
