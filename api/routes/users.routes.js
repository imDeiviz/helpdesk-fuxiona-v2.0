const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const sessionMiddleware = require('../middlewares/session.middleware');

// Ruta para obtener el perfil del usuario
router.post('/', usersController.create);
router.get('/me', sessionMiddleware, usersController.profile);


module.exports = router;
