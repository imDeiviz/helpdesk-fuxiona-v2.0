const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users.controller");
const sessionMiddleware = require("../middlewares/session.middleware");

// Ruta para crear un usuario
router.post("/", usersController.register);

// Ruta para eliminar un usuario
router.delete("/:id", usersController.deleteUser);

// Ruta para obtener el perfil del usuario
router.get("/me", sessionMiddleware, usersController.profile);

// Ruta para cambiar la contraseña del usuario
router.patch("/change-password", sessionMiddleware, usersController.changePassword); 

// Ruta para obtener todos los usuarios
router.get("/", usersController.getAllUsers);

module.exports = router;
