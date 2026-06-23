const Message = require('../models/Message');
const { paginate, paginateResponse } = require('../utils/pagination.utils');
const { sendSuccess, sendError, sendCreated, sendNotFound } = require('../utils/response.utils');

const getInbox = async (req, res) => {
  try {
    const { skip, limit, sort, page } = paginate(req.query, { ...req.query, sort: '-createdAt' });
    const filter = {
      $or: [
        { destinataires: req.user._id },
        { destinatairesUnites: req.user.unite },
        { typeDestinataire: 'broadcast' },
      ],
      supprime: false,
    };

    if (req.query.priorite) filter.priorite = req.query.priorite;

    const [data, total] = await Promise.all([
      Message.find(filter)
        .populate('expediteur', 'nom prenom matricule role')
        .sort(sort).skip(skip).limit(limit).lean(),
      Message.countDocuments(filter),
    ]);

    const withReadStatus = data.map((msg) => ({
      ...msg,
      isLu: msg.lu?.some((l) => l.utilisateur?.toString() === req.user._id.toString()),
    }));

    return sendSuccess(res, paginateResponse(withReadStatus, total, page, limit));
  } catch (err) {
    return sendError(res, err.message);
  }
};

const getSent = async (req, res) => {
  try {
    const { skip, limit, sort, page } = paginate(req.query, { ...req.query, sort: '-createdAt' });
    const [data, total] = await Promise.all([
      Message.find({ expediteur: req.user._id, supprime: false })
        .populate('destinataires', 'nom prenom matricule')
        .sort(sort).skip(skip).limit(limit).lean(),
      Message.countDocuments({ expediteur: req.user._id }),
    ]);
    return sendSuccess(res, paginateResponse(data, total, page, limit));
  } catch (err) {
    return sendError(res, err.message);
  }
};

const getOne = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id)
      .populate('expediteur', 'nom prenom matricule role')
      .populate('destinataires', 'nom prenom matricule')
      .populate('destinatairesUnites', 'nom code')
      .populate('repondA', 'sujet expediteur');

    if (!message) return sendNotFound(res, 'Message introuvable');

    // Marquer comme lu
    const alreadyRead = message.lu?.some((l) => l.utilisateur?.toString() === req.user._id.toString());
    if (!alreadyRead) {
      await Message.findByIdAndUpdate(req.params.id, {
        $push: { lu: { utilisateur: req.user._id, dateLecture: new Date() } },
      });
    }

    return sendSuccess(res, { data: message });
  } catch (err) {
    return sendError(res, err.message);
  }
};

const send = async (req, res) => {
  try {
    const message = await Message.create({ ...req.body, expediteur: req.user._id });

    // Émettre via Socket.io si disponible
    const io = req.app.get('io');
    if (io) {
      if (req.body.destinataires) {
        req.body.destinataires.forEach((userId) => {
          io.to(`user:${userId}`).emit('nouveau_message', {
            messageId: message._id,
            expediteur: req.user.matricule,
            sujet: message.sujet,
            priorite: message.priorite,
          });
        });
      }
    }

    return sendCreated(res, { data: message }, 'Message envoyé');
  } catch (err) {
    return sendError(res, err.message, 422);
  }
};

const archive = async (req, res) => {
  try {
    await Message.findByIdAndUpdate(req.params.id, { archive: true });
    return sendSuccess(res, {}, 'Message archivé');
  } catch (err) {
    return sendError(res, err.message);
  }
};

const remove = async (req, res) => {
  try {
    await Message.findByIdAndUpdate(req.params.id, { supprime: true });
    return sendSuccess(res, {}, 'Message supprimé');
  } catch (err) {
    return sendError(res, err.message);
  }
};

const getNonLus = async (req, res) => {
  try {
    const filter = {
      $or: [{ destinataires: req.user._id }, { typeDestinataire: 'broadcast' }],
      'lu.utilisateur': { $ne: req.user._id },
      supprime: false,
    };
    const count = await Message.countDocuments(filter);
    return sendSuccess(res, { data: { count } });
  } catch (err) {
    return sendError(res, err.message);
  }
};

module.exports = { getInbox, getSent, getOne, send, archive, remove, getNonLus };
