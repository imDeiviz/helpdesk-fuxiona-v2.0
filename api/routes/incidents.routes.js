const express = require('express');
const router = express.Router();
const incidentsController = require('../controllers/incidents.controller');

const sessionMiddleware = require('../middlewares/session.middleware');
const upload = require('../middlewares/upload.middleware'); // Importar el middleware de subida de archivos

// Routes for incident management
router.get('/', sessionMiddleware, incidentsController.getAll);
router.post('/', sessionMiddleware, upload.array('files', 10), incidentsController.create);

router.get('/:id', sessionMiddleware, incidentsController.getDetail);
router.delete('/:id/files', sessionMiddleware, incidentsController.removeFile);
router.patch('/:id/files', sessionMiddleware, upload.array('files', 10), incidentsController.addFiles);

router.patch('/:id', sessionMiddleware, incidentsController.update);
router.delete('/:id', sessionMiddleware, incidentsController.delete);


module.exports = router;
