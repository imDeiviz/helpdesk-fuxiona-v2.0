const express = require('express');
const router = express.Router();
const incidentsController = require('../controllers/incidents.controller');

const sessionMiddleware = require('../middlewares/session.middleware');

// Routes for incident management
router.get('/', sessionMiddleware, incidentsController.getAll);
router.post('/', sessionMiddleware, incidentsController.create);

router.get('/:id', sessionMiddleware, incidentsController.getDetail);
router.patch('/:id', sessionMiddleware, incidentsController.update);

router.delete('/:id', sessionMiddleware, incidentsController.delete);

module.exports = router;
