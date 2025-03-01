const User = require("../models/user.model");

module.exports = async (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: "No autorizado" });
  }

  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "No autorizado" });
    }
    req.user = user; // Almacenar el usuario en la solicitud
    next();
  } catch (err) {
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};
