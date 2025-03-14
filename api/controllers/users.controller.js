const createError = require("http-errors");
const User = require("../models/user.model");

module.exports.deleteUser = async (req, res, next) => {
  const { id } = req.params;
  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.status(200).json({ message: "Usuario eliminado exitosamente" });
  } catch (error) {
    next(error);
  }
};

module.exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find(); // Retrieve all users from the database
    res.status(200).json(users); // Return the list of users
  } catch (error) {
    next(error);
  }
};

module.exports.create = async (req, res, next) => {
  try {
    const { name, email, password, office } = req.body;

    // Validar que se proporcionen name, email, password y office
    if (!name || !email || !password || !office) {
      return next(createError(400, "Name, email, password y office son requeridos"));
    }

    // Crear un nuevo usuario
    const newUser = new User({ name, email, password, office });
    await newUser.save().catch(err => next(createError(500, "Error al crear el usuario")));

    res.status(201).json({ message: "Usuario creado exitosamente" });
  } catch (error) {
    next(error);
  }
};

module.exports.register = async (req, res, next) => {
  const { name, email, password, role, office } = req.body;

  // Validar que el rol sea uno de los predefinidos
  const validRoles = ["user", "admin", "tecnico"];
  if (!validRoles.includes(role)) {
    return next(createError(400, "El rol no es válido"));
  }

  // Validar que la oficina sea una de las predefinidas
  const validOffices = ["Malaga", "Marbella", "Fuengirola"];

  if (!validOffices.includes(office)) {
    return next(createError(400, "La oficina no es válida"));
  }

  try {
    const user = await User.create({ name, email, password, role, office });
    res.status(201).json({ message: "Usuario registrado exitosamente", user });
  } catch (error) {
    if (error.code === 11000) {
      next(createError(400, "El email ya está registrado"));
    } else {
      next(error);
    }
  }
};

module.exports.profile = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: "No autorizado" });
  }

  User.findById(req.session.userId)
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      res.json({
        name: user.name,
        email: user.email,
        office: user.office, // Include office in the profile response
        role: user.role, // Include role in the profile response
      });
    })
    .catch((err) => next(err));
};

module.exports.getProfile = (req, res, next) => {
  res.status(200).json(req.user);
};

module.exports.changePassword = async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const isMatch = await user.checkPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "La contraseña actual es incorrecta" });
    }

    user.password = newPassword; // La nueva contraseña se asigna
    await user.save(); // Guardar el usuario con la nueva contraseña

    res.status(200).json({ message: "Contraseña actualizada exitosamente" });
  } catch (error) {
    next(error);
  }
};

exports.user = (req, res) => {
  // Your logic for handling the user creation
  res.send("User created");
};
