module.exports = function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "https://helpdesk-fuxiona-v2-0.onrender.com"); // Permitir solicitudes desde el dominio de producción

  res.header("Access-Control-Allow-Headers", "content-type, Authorization"); // Agregar Authorization para autenticación
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");

  res.header("Access-Control-Allow-Credentials", true);

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
};
