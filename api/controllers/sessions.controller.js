const bcrypt = require("bcryptjs");
const createError = require("http-errors");
const User = require("../models/user.model");

module.exports.create = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw createError(401, "Credenciales inválidas");
    }

    const isMatch = await user.checkPassword(password);
    if (!isMatch) {
      throw createError(401, "Credenciales inválidas");
    }

    req.session.userId = user._id;

    res.status(200).json({ message: "Inicio de sesión exitoso" });
  } catch (error) {
    console.error('Error during login:', error); // Log the error for debugging
    res.status(500).json({ error: "Error interno del servidor" });

  }
};

module.exports.destroy = (req, res, next) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return next(err);
      }
      res.clearCookie("session_id");
      res.status(204).send();
    });
  } else {
    res.status(204).send();
  }
};
