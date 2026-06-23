const router = require('express').Router();
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { uploadPhoto: uploadMiddleware, handleUploadError } = require('../middleware/upload.middleware');
const ctrl = require('../controllers/personnel.controller');

const MANAGERS = ['souverain', 'super_admin', 'admin_national', 'admin_provincial', 'admin_territorial', 'admin_sectoriel', 'officier_commandant'];
const ADMINS = ['souverain', 'super_admin', 'admin_national'];

router.use(protect);

router.get('/stats', ctrl.getStats);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.post('/', authorize(...MANAGERS), ctrl.create);
router.put('/:id', authorize(...MANAGERS), ctrl.update);
router.delete('/:id', authorize(...ADMINS), ctrl.remove);
router.post('/:id/photo', authorize(...MANAGERS), uploadMiddleware.single('photo'), handleUploadError, ctrl.uploadPhoto);

module.exports = router;
