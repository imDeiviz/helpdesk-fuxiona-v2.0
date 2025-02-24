# Documentación de la Carpeta `api/`

## Descripción de Archivos

### `app.js`
Este archivo configura la aplicación Express, incluyendo la inicialización, middlewares utilizados, conexión a MongoDB y manejo de errores.

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
  cookie: { secure: false } // Asegúrate de que 'secure' esté en 'false' si estás desarrollando en localhost sin HTTPS
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

### `controllers/incidents.controller.js`
Contiene la lógica de negocio para manejar las incidencias, incluyendo las funciones para crear, obtener, actualizar y eliminar incidencias.

```javascript
const createError = require("http-errors");
const Incident = require("../models/incident.model");

module.exports.create = async (req, res, next) => {
  try {
    const { title, description } = req.body;

    // Validate that title and description are provided
    if (!title || !description) {
      throw createError(400, "Title and description are required");
    }

    // Create a new incident
    const newIncident = new Incident({ title, description });
    await newIncident.save();

    res.status(201).json({ message: "Incident created successfully", incident: newIncident, id: newIncident._id });

  } catch (error) {
    next(error);
  }
};

module.exports.getDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const incident = await Incident.findById(id);

    if (!incident) {
      throw createError(404, "Incident not found");
    }

    res.status(200).json(incident);
  } catch (error) {
    next(error);
  }
};

module.exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;

    // Update only the fields that are provided
    const updatedIncident = await Incident.findByIdAndUpdate(id, { 
      ...(title && { title }), 
      ...(description && { description }), 
      ...(status && { status }) 
    }, { new: true });

    if (!updatedIncident) {
      throw createError(404, "Incident not found");
    }

    res.status(200).json({ message: "Incident updated successfully", incident: updatedIncident });
  } catch (error) {
    next(error);
  }
};

module.exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedIncident = await Incident.findByIdAndDelete(id);

    if (!deletedIncident) {
      throw createError(404, "Incident not found");
    }

    res.status(200).json({ message: "Incident deleted successfully" });
  } catch (error) {
    next(error);
  }
};
```

### `models/incident.model.js`
Define la estructura del modelo de datos para las incidencias, incluyendo los campos y validaciones.

```javascript
const mongoose = require("mongoose");

const incidentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "The title is required"],
    },
    description: {
      type: String,
      required: [true, "The description is required"],
    },
    status: { 
      creationDate: {
        type: Date,
        default: Date.now,
      },
      type: String,
      enum: ["Pending", "Resolved"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

const Incident = mongoose.model("Incident", incidentSchema);
module.exports = Incident;
```

### `routes/incidents.routes.js`
Define las rutas para la gestión de incidencias, incluyendo los métodos HTTP y los controladores asociados.

```javascript
const express = require('express');
const router = express.Router();
const incidentsController = require('../controllers/incidents.controller');
const sessionMiddleware = require('../middlewares/session.middleware');

router.post('/', sessionMiddleware, incidentsController.create);
router.get('/:id', sessionMiddleware, incidentsController.getDetail);
router.patch('/:id', sessionMiddleware, incidentsController.update);
router.delete('/:id', sessionMiddleware, incidentsController.delete);

module.exports = router;
```

### `config/routes.config.js`
Configura las rutas de la API y maneja los errores relacionados con las rutas.

```javascript
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const createError = require("http-errors");
const usersRoutes = require('../routes/users.routes');
const incidentsRoutes = require('../routes/incidents.routes');
const sessionsRoutes = require('../routes/sessions.routes');
const sessionMiddleware = require("../middlewares/session.middleware");

router.use('/users', usersRoutes);
router.use('/incidents', incidentsRoutes);
router.use('/sessions', sessionsRoutes);

router.use((req, res, next) => {
  next(createError(404, "Route not found"));
});

// Manejo de errores...
router.use((error, req, res, next) => {
  if (
    error instanceof mongoose.Error.CastError &&
    error.message.includes("_id")
  )
    error = createError(404, "Resource not found");
  else if (error instanceof mongoose.Error.ValidationError)
    error = createError(400, error);
  else if (!error.status) error = createError(500, error.message);
  console.error(error);

  const data = {};
  data.message = error.message;
  if (error.errors) {
    data.errors = Object.keys(error.errors).reduce((errors, errorKey) => {
      errors[errorKey] =
        error.errors[errorKey]?.message || error.errors[errorKey];
      return errors;
    }, {});
  }
  res.status(error.status).json(data);
});

module.exports = router;
```

### `controllers/sessions.controller.js`
Maneja la lógica de negocio relacionada con las sesiones de usuario, incluyendo el inicio y cierre de sesión.

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

// Otras funciones...
```

### `controllers/users.controller.js`
Maneja la lógica de negocio para manejar la creación y gestión de usuarios.

```javascript
const createError = require("http-errors");
const User = require("../models/user.model");

module.exports.create = async (req, res, next) => {
  try {
    const { name, email, password, office } = req.body;

    // Validar que se proporcionen name, email, password y office
    if (!name || !email || !password || !office) {
      throw createError(400, "Name, email, password y office son requeridos");
    }

    // Crear un nuevo usuario
    const newUser = new User({ name, email, password, office });
    await newUser.save();

    res.status(201).json({ message: "Usuario creado exitosamente" });
  } catch (error) {
    next(error);
  }
};

// Otras funciones...
```

### `middlewares/cors.middleware.js`
Define un middleware para manejar las solicitudes CORS.

```javascript
module.exports = (req, res, next) => {
  res.header(
    "Access-Control-Allow-Origin",
    process.env.CORS_ORIGIN || "*"
  );

  res.header("Access-Control-Allow-Headers", "content-type");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Credentials", true);

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
};
```

### `middlewares/session.middleware.js`
Define un middleware para manejar la autenticación de sesiones de usuario.

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
    req.user = user; // Almacenar el usuario en la solicitud
    next();
  } catch (err) {
    next(err);
  }
};
```

### `models/session.model.js`
Define el modelo de datos para las sesiones de usuario.

```javascript
const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600 // 1 hour
  },
  lastAccess: { type: Date, default: Date.now }
});

const Session = mongoose.model('Session', sessionSchema);
module.exports = Session;
```

### `models/user.model.js`
Define el modelo de datos para los usuarios.

```javascript
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const SALT_WORK_FACTOR = 10;
const EMAIL_PATTERN =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "User name is required"],
      maxLength: [30, "User name characters must be lower than 30"],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      required: [true, "User email is required"],
      match: [EMAIL_PATTERN, "Invalid user email pattern"],
    },
    password: {
      type: String,
      required: [true, "User password is required"],
      validate: {
        validator: function (v) {
          return PASSWORD_PATTERN.test(v);
        },
        message: (props) => `${props.value} is not a valid password!`,
      },
    },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    office: {
      type: String,
      required: [true, "Office is required"]
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.__v;
        delete ret._id;
        delete ret.password;
        delete ret.activateToken;

        ret.id = doc.id;
        return ret;
      },
    },
  }
);

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

### Estructura del Proyecto

```
api/
├── .env
├── .env.template
├── .gitignore
├── app.js
├── config/
│   ├── db.config.js
│   └── routes.config.js
├── controllers/
│   ├── incidents.controller.js
│   ├── sessions.controller.js
│   └── users.controller.js
├── middlewares/
│   ├── cors.middleware.js
│   └── session.middleware.js
├── models/
│   ├── incident.model.js
│   ├── session.model.js
│   └── user.model.js
├── routes/
│   ├── incidents.routes.js
│   ├── sessions.routes.js
│   └── users.routes.js
├── node_modules/
├── package-lock.json
└── package.json

## Pruebas con Postman

Para realizar pruebas de la API utilizando Postman, sigue estos pasos:

1. **Importar la colección de Postman**:
   - Si tienes una colección de Postman, puedes importarla haciendo clic en "Importar" en la esquina superior izquierda de la aplicación Postman y seleccionando el archivo de colección.

2. **Ejemplos de Solicitudes**:
   - **Crear una Incidencia**:
     - Método: `POST`
     - URL: `http://localhost:3000/api/v1/incidents`
     - Cuerpo (JSON):
       ```json
       {
         "title": "Título de la incidencia",
         "description": "Descripción de la incidencia"
       }
       ```

   - **Obtener Detalle de una Incidencia**:
     - Método: `GET`
     - URL: `http://localhost:3000/api/v1/incidents/{id}`

   - **Actualizar una Incidencia**:
     - Método: `PATCH`
     - URL: `http://localhost:3000/api/v1/incidents/{id}`
     - Cuerpo (JSON):
       ```json
       {
         "title": "Título actualizado",
         "description": "Descripción actualizada"
       }
       ```

   - **Eliminar una Incidencia**:
     - Método: `DELETE`
     - URL: `http://localhost:3000/api/v1/incidents/{id}`

   - **Crear un Usuario**:
     - Método: `POST`
     - URL: `http://localhost:3000/api/v1/users`
     - Cuerpo (JSON):
       ```json
       {
         "name": "Nombre del usuario",
         "email": "usuario@example.com",
         "password": "contraseñaSegura",
         "office": "Oficina"
       }
       ```

   - **Obtener Perfil del Usuario**:
     - Método: `GET`
     - URL: `http://localhost:3000/api/v1/users/me`

   - **Iniciar Sesión**:
     - Método: `POST`
     - URL: `http://localhost:3000/api/v1/sessions`
     - Cuerpo (JSON):
       ```json
       {
         "email": "usuario@example.com",
         "password": "contraseñaSegura"
       }
       ```

   - **Cerrar Sesión**:
     - Método: `DELETE`
     - URL: `http://localhost:3000/api/v1/sessions`

3. **Respuestas Esperadas**:
   - Para cada solicitud, asegúrate de verificar las respuestas esperadas en Postman para confirmar que la API está funcionando correctamente.
