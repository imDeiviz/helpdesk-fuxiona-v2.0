module.exports = (req, res, next) => {

  res.header("Access-Control-Allow-Origin", "http://localhost:5173");

  res.header("Access-Control-Allow-Headers", "content-type, Authorization"); // Agregar Authorization para autenticación
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");

  res.header("Access-Control-Allow-Credentials", true);

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
};
