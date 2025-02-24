# helpdesk-fuxiona-2

## Documentación de la Carpeta `api/`

### Descripción Detallada de Cada Archivo

- **app.js**: Configura la aplicación Express, inicializa la conexión a MongoDB y define los middlewares y rutas.
  ```javascript
  require("dotenv").config();

  const express = require("express");
  const logger = require("morgan");
  const cors = require("./middlewares/cors.middleware");
  const session = require('express-session');
  const mongoose = require('mongoose');
  const cookieParser = require('cookie-parser');

  /* DB init */
  require("./config/db.config");

  const app = express();

  /* Middlewares */
  app.use(express.json());
  app.use(logger("dev"));
  app.use(cors);
  app.use(cookieParser());

  /* Configuración de la sesión */
  app.use(session({
    secret: process.env.SESSION_SECRET || 'PB5^H8f&v$_Nn7q~4r,Ksk',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  }));

  /* Conectar a MongoDB */
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error al conectar a MongoDB', err));

  /* API Routes Configuration */
  const routesConfig = require("./config/routes.config");
  app.use("/api/v1", routesConfig);

  /* Manejo de errores */
  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({
      message: err.message || 'Error interno del servidor'
    });
  });

  const port = Number(process.env.PORT || 3000);
  app.listen(port, () => console.info(`Application running at port ${port}`));

  module.exports = app;
  ```

- **package.json**: Contiene las dependencias y scripts del proyecto.
  ```json
  {
    "name": "api",
    "version": "1.0.0",
    "main": "index.js",
    "scripts": {
      "dev": "node --watch app.js",
      "start": "node app.js"
    },
    "dependencies": {
      "bcryptjs": "^2.4.3",
      "cookie-parser": "^1.4.7",
      "dotenv": "^16.4.7",
      "express": "^4.21.2",
      "express-session": "^1.18.1",
      "mongoose": "^8.10.0",
      "morgan": "^1.10.0"
    }
  }
  ```

- **config/db.config.js**: Maneja la conexión a la base de datos MongoDB.
  ```javascript
  const mongoose = require("mongoose");

  const MONGODB_URI =
    process.env.MONGODB_URI || "mongodb+srv://dmrojassantana:mcXqOnlztBPqLlp7@fuxionahelpdesk.28xum.mongodb.net/";

  mongoose
    .connect(MONGODB_URI)
    .then(() =>
      console.info(`Successfully connected to the database ${MONGODB_URI}`)
    )
    .catch((error) => {
      console.error(
        `An error occurred trying to connect to the database ${MONGODB_URI}`,
        error
      );
      process.exit(0);
    });

  process.on("SIGINT", () => {
    mongoose.connection.close().finally(() => {
      console.log(`Database connection closed`);
      process.exit(0);
    });
  });
  ```

- **controllers/users.controller.js**: Gestiona las operaciones relacionadas con los usuarios.
  ```javascript
  const createError = require("http-errors");
  const User = require("../models/user.model");

  module.exports.create = async (req, res, next) => {
    try {
      const { name, email, password, office } = req.body;

      if (!name || !email || !password || !office) {
        throw createError(400, "Name, email, password y office son requeridos");
      }

      const newUser = new User({ name, email, password, office });
      await newUser.save();

      res.status(201).json({ message: "Usuario creado exitosamente" });
    } catch (error) {
      next(error);
    }
  };
  ```

- **controllers/sessions.controller.js**: Maneja las operaciones de inicio y cierre de sesión.
  ```javascript
  const bcrypt = require('bcryptjs');
  const createError = require('http-errors');
  const User = require('../models/user.model');

  module.exports.create = async (req, res, next) => {
    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw createError(401, 'Credenciales inválidas');
      }

      const isMatch = await user.checkPassword(password);
      if (!isMatch) {
        throw createError(401, 'Credenciales inválidas');
      }

      req.session.userId = user._id; 
      res.status(200).json({ message: 'Inicio de sesión exitoso' });
    } catch (error) {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };
  ```

- **middlewares/session.middleware.js**: Verifica la autenticación del usuario.
  ```javascript
  const User = require('../models/user.model');

  module.exports = async (req, res, next) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    try {
      const user = await User.findById(req.session.userId);
      if (!user) {
        return res.status(401).json({ message: 'No autorizado' });
      }
      req.user = user;
      next();
    } catch (err) {
      next(err);
    }
  };
  ```

- **models/user.model.js**: Define el esquema del modelo de usuario.
  ```javascript
  const mongoose = require("mongoose");
  const bcrypt = require("bcryptjs");

  const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    office: { type: String, required: true }
  });

  userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
      this.password = await bcrypt.hash(this.password, 10);
    }
    next();
  });

  userSchema.methods.checkPassword = function (passwordToCheck) {
    return bcrypt.compare(passwordToCheck, this.password);
  };

  const User = mongoose.model("User", userSchema);
  module.exports = User;
  ```

- **models/session.model.js**: Define el esquema del modelo de sesión.
  ```javascript
  const mongoose = require('mongoose');

  const sessionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now, expires: 3600 },
    lastAccess: { type: Date, default: Date.now }
  });

  const Session = mongoose.model('Session', sessionSchema);
  module.exports = Session;
  ```

- **routes/users.routes.js**: Define las rutas para las operaciones de usuario.
  ```javascript
  const express = require('express');
  const router = express.Router();
  const usersController = require('../controllers/users.controller');
  const sessionMiddleware = require('../middlewares/session.middleware');

  router.post('/', usersController.create);
  router.get('/me', sessionMiddleware, usersController.profile);

  module.exports = router;
  ```

- **routes/sessions.routes.js**: Define las rutas para las operaciones de sesión.
  ```javascript
  const express = require('express');
  const router = express.Router();
  const sessionsController = require('../controllers/sessions.controller');

  router.post('/', sessionsController.create);
  router.delete('/', sessionsController.destroy);

  module.exports = router;
  ```

### Cómo Ejecutar Pruebas con Postman

1. **Iniciar el Servidor**: Asegúrate de que el servidor esté en funcionamiento ejecutando el siguiente comando en la terminal:
   ```bash
   npm run dev
   ```

2. **Probar las Rutas**:
   - **Crear Usuario**: Envía una solicitud POST a `http://localhost:3000/api/v1/users` con el cuerpo en formato JSON:
     ```json
     {
       "name": "Nombre",
       "email": "correo@example.com",
       "password": "contraseña",
       "office": "Oficina"
     }
     ```

   - **Iniciar Sesión**: Envía una solicitud POST a `http://localhost:3000/api/v1/sessions` con el cuerpo en formato JSON:
     ```json
     {
       "email": "correo@example.com",
       "password": "contraseña"
     }
     ```

   - **Obtener Perfil**: Envía una solicitud GET a `http://localhost:3000/api/v1/users/me` con el token de sesión en las cookies.

### Conclusión
Esta documentación está diseñada para ser clara y comprensible, orientada tanto a nuevos desarrolladores como a aquellos que requieran un conocimiento profundo del API.
