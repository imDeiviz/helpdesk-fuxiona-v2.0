module.exports = (req, res, next) => {

  const allowedOrigins = ["http://localhost:5173", "https://helpdesk-fuxiona-v2-0.onrender.com"];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header("Access-Control-Allow-Headers", "content-type, Authorization"); // Agregar Authorization para autenticación
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");

  res.header("Access-Control-Allow-Credentials", true);

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
};
