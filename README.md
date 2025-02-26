# Estructura del Proyecto

```
api/
├── config/
│   ├── db.config.js
│   └── routes.config.js
├── controllers/
│   ├── incidents.controller.js
│   ├── sessions.controller.js
│   └── users.controller.js
├── middlewares/
│   ├── cors.middleware.js
│   ├── session.middleware.js
│   └── upload.middleware.js
├── models/
│   ├── incident.model.js
│   ├── sessions.routes.js
│   └── users.routes.js
├── routes/
│   ├── incidents.routes.js
│   ├── users.routes.js
├── app.js
└── package.json
```

# Descripción de Archivos

- **app.js**: 
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

- **config/db.config.js**: 
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

- **config/routes.config.js**:
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

- **controllers/incidents.controller.js**: 
```javascript
const createError = require("http-errors");
const Incident = require("../models/incident.model");

module.exports.getAll = async (req, res, next) => {
  try {
    const incidents = await Incident.find();
    res.status(200).json(incidents);
  } catch (error) {
    next(createError(500, "Error retrieving incidents"));
  }
};

module.exports.create = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const { office, name, email } = req.user; // Extraer datos del usuario autenticado

    // Validar que se proporcionen título y descripción
    if (!title || !description) {
      throw createError(400, "El título y la descripción son obligatorios");
    }

    // Procesar archivos subidos (si existen)
    let files = [];
    if (req.files && req.files.length) {
      files = req.files.map(file => file.path); 
    }
    console.log(files);

    // Crear una nueva incidencia
    const newIncidentData = {
      title,
      description,
      office,
      name,
      email,
      files,
    };
    console.log(newIncidentData);

    const newIncident = new Incident(newIncidentData);
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

    // Actualizar solo los campos que se proporcionan
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

- **controllers/sessions.controller.js**: 
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

module.exports.destroy = (req, res, next) => {
  if (req.session) {
    req.session.destroy(err => {
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
```

- **controllers/users.controllers.js**: 
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

module.exports.register = async (req, res, next) => {
  const { name, email, password, role, office } = req.body;

  try {
    const user = await User.create({ name, email, password, role, office });
    res.status(201).json(user);
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
    .then(user => {
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      res.json({ 
        name: user.name,
        email: user.email,
        office: user.office // Include office in the profile response
      });
    })
    .catch(err => next(err));
};

module.exports.getProfile = (req, res, next) => {
  res.status(200).json(req.user);
};

exports.user = (req, res) => {
  // Your logic for handling the user creation
  res.send('User created');
};
```

- **middlewares/cors.middleware.js**: 
```javascript
module.exports = (req, res, next) => {
  res.header(
    "Access-Control-Allow-Origin",
    process.env.CORS_ORIGIN || "mongodb+srv://dmrojassantana:mcXqOnlztBPqLlp7@fuxionahelpdesk.28xum.mongodb.net/"
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

- **middlewares/session.middleware.js**: 
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
- **middlewares/upload.middleware.js**:
```javascript
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = /txt|png|pdf|zip|rar/;
  const extension = file.originalname.split('.').pop().toLowerCase();
  if (allowedExtensions.test(extension)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido'), false);
  }
};

const upload = multer({ storage, fileFilter });
module.exports = upload;
```
- **models/incident.model.js**:
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
      type: String,
      enum: ["Pending", "Resolved"],
      default: "Pending",
    },
    office: { 
      type: String, 
      required: true 
    },
    name: { 
      type: String, 
      required: true 
    },
    email: { 
      type: String, 
      required: true 
    },
    files: [{ type: String }], 
    creationDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Incident = mongoose.model("Incident", incidentSchema);
module.exports = Incident;
```

- **models/session.model.js**:
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
- **models/user.model.js**:
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

- **routes/incidents.routes.js**:
```javascript
const express = require('express');
const router = express.Router();
const incidentsController = require('../controllers/incidents.controller');

const sessionMiddleware = require('../middlewares/session.middleware');
const upload = require('../middlewares/upload.middleware'); // Importar el middleware de subida de archivos

// Routes for incident management
router.get('/', sessionMiddleware, incidentsController.getAll);
router.post('/', sessionMiddleware, upload.array('files', 10), incidentsController.create);

router.get('/:id', sessionMiddleware, incidentsController.getDetail);
router.patch('/:id', sessionMiddleware, incidentsController.update);
router.delete('/:id', sessionMiddleware, incidentsController.delete);

module.exports = router;
```

- **routes/sessions.routes.js**
```javascript
const express = require('express');
const router = express.Router();
const sessionsController = require('../controllers/sessions.controller');

router.post('/', sessionsController.create);
router.delete('/', sessionsController.destroy);

module.exports = router;
```

- **routes/users.routes.js**
```javascript
const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const sessionMiddleware = require('../middlewares/session.middleware');

// Ruta para obtener el perfil del usuario
router.post('/', usersController.create);
router.get('/me', sessionMiddleware, usersController.profile);


module.exports = router;
```

# Pruebas con Postman

## 1. Crear una nueva incidencia
- **Método**: POST
- **URL**: `http://localhost:3000/api/v1/incidents`
- **Cuerpo** (JSON):
```json
{
  "title": "Título de la incidencia",
  "description": "Descripción de la incidencia"
}
```
- **Autenticación**: Asegúrate de incluir el token de sesión en los encabezados.

## 2. Obtener todas las incidencias
- **Método**: GET
- **URL**: `http://localhost:3000/api/v1/incidents`
- **Autenticación**: Asegúrate de incluir el token de sesión en los encabezados.

## 3. Obtener detalles de una incidencia
- **Método**: GET
- **URL**: `http://localhost:3000/api/v1/incidents/:id`
- **Autenticación**: Asegúrate de incluir el token de sesión en los encabezados.

## 4. Actualizar una incidencia
- **Método**: PATCH
- **URL**: `http://localhost:3000/api/v1/incidents/:id`
- **Cuerpo** (JSON):
```json
{
  "title": "Título actualizado",
  "description": "Descripción actualizada"
}
```
- **Autenticación**: Asegúrate de incluir el token de sesión en los encabezados.

## 5. Eliminar una incidencia
- **Método**: DELETE
- **URL**: `http://localhost:3000/api/v1/incidents/:id`
- **Autenticación**: Asegúrate de incluir el token de sesión en los encabezados.

## 6. Crear un nuevo usuario
- **Método**: POST
- **URL**: `http://localhost:3000/api/v1/users`
- **Cuerpo** (JSON):
```json
{
  "name": "Nombre del usuario",
  "email": "correo@ejemplo.com",
  "password": "contraseña"
}
```

## 7. Obtener perfil del usuario
- **Método**: GET
- **URL**: `http://localhost:3000/api/v1/users/me`
- **Autenticación**: Asegúrate de incluir el token de sesión en los encabezados.

## 8. Actualizar perfil del usuario
- **Método**: PATCH
- **URL**: `http://localhost:3000/api/v1/users/me`
- **Cuerpo** (JSON):
```json
{
  "name": "Nuevo nombre"
}
```
- **Autenticación**: Asegúrate de incluir el token de sesión en los encabezados.

## 9. Eliminar usuario
- **Método**: DELETE
- **URL**: `http://localhost:3000/api/v1/users/me`
- **Autenticación**: Asegúrate de incluir el token de sesión en los encabezados.
