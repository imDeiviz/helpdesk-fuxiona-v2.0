module.exports = (req, res, next) => {
  // Middleware para habilitar CORS

  // Permitir el origen de la aplicación frontend
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");

  // Permitir los encabezados necesarios
  res.header("Access-Control-Allow-Headers", "content-type");
  // Permitir los métodos HTTP necesarios
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");

  // Permitir el uso de credenciales
  res.header("Access-Control-Allow-Credentials", true);

  // Manejar las solicitudes OPTIONS
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
};
