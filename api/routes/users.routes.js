const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users.controller");
const sessionMiddleware = require("../middlewares/session.middleware");

// Ruta para crear un usuario
router.post("/", usersController.register);

// Ruta para obtener el perfil del usuario
router.get("/me", sessionMiddleware, usersController.profile);

// Ruta para obtener todos los usuarios
router.get("/", usersController.getAllUsers);

module.exports = router;