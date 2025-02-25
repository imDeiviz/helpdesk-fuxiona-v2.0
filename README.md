# Estructura del Proyecto

```
api/
├── config/
│   ├── db.config.js
│   └── routes.config.js
├── controllers/
│   ├── incidents.controller.js
│   └── users.controller.js
├── middlewares/
│   ├── cors.middleware.js
│   ├── session.middleware.js
│   └── upload.middleware.js
├── models/
│   └── incident.model.js
├── routes/
│   ├── incidents.routes.js
│   └── users.routes.js
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
    const { office, name, email } = req.user;

    if (!title || !description) {
      throw createError(400, "El título y la descripción son obligatorios");
    }

    let files = [];
    if (req.files && req.files.length) {
      files = req.files.map(file => file.path); 
    }

    const newIncidentData = {
      title,
      description,
      office,
      name,
      email,
      files,
    };

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

- **routes/users.routes.js**: 
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
    office: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
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

- **package.json**: 
```json
{
  "name": "api",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "dev": "node --watch app.js",
    "start": "node app.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "description": "",
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cookie-parser": "^1.4.7",
    "dotenv": "^16.4.7",
    "express": "^4.21.2",
    "express-session": "^1.18.1",
    "mongoose": "^8.10.0",
    "morgan": "^1.10.0",
    "multer": "^1.4.5-lts.1"
  }
}
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
