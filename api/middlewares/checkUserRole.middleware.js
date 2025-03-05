const createError = require("http-errors");

const checkUserRole = (req, res, next) => {
  const { role } = req.user; // Extraer el rol del usuario autenticado

  // Si el rol es "user", no se permite cambiar el estado de la incidencia
  if (role === 'user' && req.body.status) {
    return next(createError(403, "No tienes permiso para cambiar el estado de la incidencia"));
  }

  next(); // Permitir continuar si no hay restricciones
};

module.exports = checkUserRole;
