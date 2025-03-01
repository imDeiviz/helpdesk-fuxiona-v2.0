# Estructura del Proyecto

## Resumen de Archivos

- **api/**: Contiene toda la lógica del backend de la aplicación.
- **config/**: Archivos de configuración para la base de datos y las rutas.
- **controllers/**: Controladores que manejan la lógica de negocio y las respuestas a las solicitudes.
- **middlewares/**: Middleware que se utiliza para manejar solicitudes y respuestas, como la autenticación y la carga de archivos.
- **models/**: Modelos de datos que definen la estructura de los documentos en la base de datos.
- **routes/**: Definiciones de rutas para la API.
- **uploads/**: Carpeta para almacenar archivos subidos.
- **app.js**: Archivo principal que inicializa la aplicación y configura middlewares y rutas.
- **package.json**: Archivo de configuración del proyecto que incluye dependencias y scripts.

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
│   ├── sessions.routes.js
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
const session = require("express-session");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

/* DB init */
require("./config/db.config");

const app = express();

/* Middlewares */
app.use(express.json());
app.use(logger("dev"));
app.use(cors);
app.use(cookieParser());

/* Configuración de la sesión */
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,

    cookie: { secure: false }, // Asegúrate de que 'secure' esté en 'false' si estás desarrollando en localhost sin HTTPS
  })
);

/* Conectar a MongoDB */
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log("Conectado a MongoDB"))
  .catch((err) => console.error("Error al conectar a MongoDB", err));

/* Servir archivos estáticos */
app.use("/uploads", express.static("uploads"));

/* API Routes Configuration */
const routesConfig = require("./config/routes.config");

app.use("/api/v1", routesConfig);

/* Manejo de errores */
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    message: err.message || "Error interno del servidor",
  });
});

const port = Number(process.env.PORT || 3000);

app.listen(port, () => console.info(`Application running at a correct port`));

module.exports = app;

```

- **config/db.config.js**: 
```javascript
const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;

mongoose
  .connect(MONGODB_URI)
  .then(() => console.info(`Successfully connected to the database`))
  .catch((error) => {
    console.error(`An error occurred trying to connect to the database`, error);
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
const usersRoutes = require("../routes/users.routes");
const incidentsRoutes = require("../routes/incidents.routes");

const sessionsRoutes = require("../routes/sessions.routes");
const sessionMiddleware = require("../middlewares/session.middleware");

router.use("/users", usersRoutes);
router.use("/incidents", incidentsRoutes);

router.use("/sessions", sessionsRoutes);

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

const cloudinary = require("cloudinary").v2;

const EXTENSIONS_RAW = [
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "txt",
  "zip",
  "rar",
];

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
    const { title, description, priority } = req.body;

    const { office, name, email } = req.user; // Extraer datos del usuario autenticado

    // Validar que se proporcionen título y descripción
    if (!title || !description) {
      throw createError(400, "El título y la descripción son obligatorios");
    }

    // Procesar archivos subidos (si existen)
    let files = [];
    if (req.files && req.files.length) {
      files = await Promise.all(
        req.files.map(async (file) => {
          const ext = file.originalname.split(".").pop().toLowerCase();
          const options = EXTENSIONS_RAW.includes(ext)
            ? { resource_type: "raw" }
            : {};
          const public_id = `helpdesk-uploads/${file.originalname}`;
          const uploadResult = await cloudinary.uploader.upload(file.path, {
            ...options,
            public_id,
          });
          return {
            url: uploadResult.secure_url,
            public_id: uploadResult.public_id,
          };
        })
      );
    }

    // Crear una nueva incidencia
    const newIncidentData = {
      title,
      description,
      office,
      name,
      email,
      files,
      priority: priority || "Baja", // Se asigna prioridad por defecto si no se envía
    };

    const newIncident = new Incident(newIncidentData);
    await newIncident.save();

    res
      .status(201)
      .json({
        message: "Incident created successfully",
        incident: newIncident,
        id: newIncident._id,
      });
  } catch (error) {
    next(error);
  }
};

module.exports.removeFile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { public_id } = req.body; // Se espera recibir el public_id del archivo

    if (!public_id) {
      return res
        .status(400)
        .json({
          message: "El public_id es requerido para eliminar el archivo",
        });
    }

    // Eliminar la referencia del archivo del array 'files' de la incidencia
    const updatedIncident = await Incident.findById(id);

    const fileToDelete = updatedIncident.files.find(
      (file) => file.public_id === public_id
    );

    if (!fileToDelete) {
      return res
        .status(404)
        .json({ message: "Archivo no encontrado en la incidencia" });
    }

    updatedIncident.files = updatedIncident.files.filter(
      (file) => file.public_id !== public_id
    );

    await updatedIncident.save();

    if (!updatedIncident) {
      throw createError(404, "Incidencia no encontrada");
    }

    // Eliminar el archivo de Cloudinary y forzar la invalidación de la caché

    const config = EXTENSIONS_RAW.includes(public_id.split(".").pop())
      ? { resource_type: "raw" }
      : {};

    const result = await cloudinary.uploader.destroy(public_id, {
      invalidate: true,
      ...config,
    });

    if (result.result !== "ok") {
      return res
        .status(500)
        .json({
          message: "No se pudo eliminar el archivo en Cloudinary",
          result,
        });
    }

    res
      .status(200)
      .json({
        message: "Archivo eliminado correctamente",
        incident: updatedIncident,
      });
  } catch (error) {
    next(error);
  }
};

module.exports.addFiles = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ message: "No se ha enviado ningún archivo" });
    }

    // Almacenar las URLs de Cloudinary en lugar de las rutas locales
    const newFiles = await Promise.all(
      req.files.map(async (file) => {
        const ext = file.originalname.split(".").pop().toLowerCase();
        const options = EXTENSIONS_RAW.includes(ext)
          ? { resource_type: "raw" }
          : {};
        const public_id = `helpdesk-uploads/${file.originalname
          .split(".")
          .slice(0, -1)
          .join(".")}`;
        const uploadResult = await cloudinary.uploader.upload(file.path, {
          ...options,
          public_id,
        });
        return {
          url: uploadResult.secure_url,
          public_id: uploadResult.public_id,
        };
      })
    );

    const updatedIncident = await Incident.findByIdAndUpdate(
      id,
      { $push: { files: { $each: newFiles } } },
      { new: true }
    );

    if (!updatedIncident) {
      return res.status(404).json({ message: "Incidencia no encontrada" });
    }

    res
      .status(200)
      .json({
        message: "Archivos añadidos correctamente",
        incident: updatedIncident,
      });
  } catch (error) {
    next(error);
  }
};

module.exports.downloadFile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { filePath } = req.body; // Ruta del archivo a descargar

    // Verificar que el incidente exista
    const incident = await Incident.findById(id);
    if (!incident) {
      throw createError(404, "Incident not found");
    }

    // Redirigir a la URL de Cloudinary para descargar el archivo
    const fileUrl = incident.files.find((file) => file.url === filePath);
    if (!fileUrl) {
      throw createError(404, "File not found in incident");
    }

    res.redirect(fileUrl.url); // Redirigir a la URL del archivo en Cloudinary
  } catch (error) {
    next(error);
  }
};

module.exports.getDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority } = req.body;

    // Actualizar solo los campos que se proporcionan
    const updatedIncident = await Incident.findByIdAndUpdate(
      id,
      {
        ...(title && { title }),
        ...(description && { description }),
        ...(status && { status }),
        ...(priority && { priority }),
      },
      { new: true }
    );

    if (!updatedIncident) {
      throw createError(404, "Incident not found");
    }

    res
      .status(200)
      .json({
        message: "Incident updated successfully",
        incident: updatedIncident,
      });
  } catch (error) {
    next(error);
  }
};

module.exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedIncident = await Incident.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedIncident) {
      throw createError(404, "Incident not found");
    }

    res
      .status(200)
      .json({
        message: "Incident updated successfully",
        incident: updatedIncident,
      });
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
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      res.json({
        name: user.name,
        email: user.email,
        office: user.office, // Include office in the profile response
      });
    })
    .catch((err) => next(err));
};

module.exports.getProfile = (req, res, next) => {
  res.status(200).json(req.user);
};

exports.user = (req, res) => {
  // Your logic for handling the user creation
  res.send("User created");
};
```

- **middlewares/cors.middleware.js**: 
```javascript
module.exports = (req, res, next) => {
  res.header("Access-Control-Allow-Origin", process.env.MONGODB_URI);

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
```
- **middlewares/upload.middleware.js**:
```javascript
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

// Configurar Cloudinary con las credenciales del entorno
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configurar el almacenamiento en Cloudinary
const storage = new CloudinaryStorage({
  params: (req, file) => {
    const params = {
      folder: "helpdesk-uploads",
      allowedFormats: [
        "jpg",
        "png",
        "gif",
        "mp4",
        "pdf",
        "doc",
        "docx",
        "xls",
        "xlsx",
        "txt",
        "zip",
        "rar",
      ],
      public_id: file.originalname, // Almacenar el public_id como el nombre original del archivo
      resource_type: "auto",
    };

    // Determine resource type based on file extension
    const ext = file.originalname.split(".").pop().toLowerCase();
    if (
      ["pdf", "doc", "docx", "xls", "xlsx", "txt", "zip", "rar"].includes(ext)
    ) {
      params.resource_type = "raw";
    }

    return params;
  },

  cloudinary: cloudinary,
});

// Crear el middleware multer con el storage de Cloudinary
const fileFilter = (req, file, cb) => {
  const allowedExtensions = [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "mp4",
    "pdf",
    "doc",
    "docx",
    "xls",
    "xlsx",
    "txt",
    "zip",
    "rar",
  ];
  const extension = file.originalname.split(".").pop().toLowerCase();
  if (allowedExtensions.includes(extension)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de archivo no permitido: ${extension}`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // Limitar el tamaño del archivo a 10 MB
  },
});

module.exports = upload;
```
- **models/incident.model.js**:
```javascript
const mongoose = require("mongoose");

const incidentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  office: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  files: [
    {
      url: { type: String },
      public_id: { type: String },
    },
  ],
  priority: { type: String, default: "Baja" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Incident", incidentSchema);

```

- **models/session.model.js**:
```javascript
const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600, // 1 hour
  },
  lastAccess: { type: Date, default: Date.now },
});

const Session = mongoose.model("Session", sessionSchema);
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
      required: [true, "Office is required"],
    },
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
const express = require("express");
const router = express.Router();
const incidentsController = require("../controllers/incidents.controller");
const upload = require("../middlewares/upload.middleware");
const sessionMiddleware = require("../middlewares/session.middleware");

// Rutas para la gestión de incidencias
router.get("/", incidentsController.getAll);
router.post(
  "/",
  sessionMiddleware,
  upload.array("files", 10),
  incidentsController.create
);

router.patch(
  "/:id/files",
  sessionMiddleware,
  upload.array("files", 10),
  incidentsController.addFiles
);
router.delete("/:id/files", sessionMiddleware, incidentsController.removeFile);

router.get("/:id", incidentsController.getDetail);
router.patch("/:id", incidentsController.update);
router.delete("/:id", incidentsController.delete);

module.exports = router;
```

- **routes/sessions.routes.js**
```javascript
const express = require("express");
const router = express.Router();
const sessionsController = require("../controllers/sessions.controller");

router.post("/", sessionsController.create);
router.delete("/", sessionsController.destroy);

module.exports = router;

```

- **routes/users.routes.js**
```javascript
const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users.controller");
const sessionMiddleware = require("../middlewares/session.middleware");

// Ruta para obtener el perfil del usuario
router.post("/", usersController.create);
router.get("/me", sessionMiddleware, usersController.profile);

module.exports = router;

```

# Pruebas con Postman

1. Crear Usuario
Método: POST
URL: http://localhost:3000/api/v1/users
Headers (opcional):
Content-Type: application/json
Body (raw, JSON):
json
Copiar
Editar
{
  "name": "Nombre del usuario",
  "email": "usuario@example.com",
  "password": "contraseñaSegura",
  "office": "Oficina X"
}

Descripción:
Este endpoint crea un nuevo usuario en la base de datos.
Respuesta Exitosa (201 Created):
json

{
  "message": "Usuario creado exitosamente"
}

2. Inicio de Sesión
Método: POST
URL: http://localhost:3000/api/v1/sessions
Headers (opcional):
Content-Type: application/json
Body (raw, JSON):
json
Copiar
Editar
{
  "email": "usuario@example.com",
  "password": "contraseñaSegura"
}
Descripción:
Inicia sesión con las credenciales del usuario, estableciendo la sesión en el servidor.
Respuesta Exitosa (200 OK):
json

{
  "message": "Inicio de sesión exitoso"
}

A partir de este momento, el servidor creará una sesión (guardando req.session.userId).
Nota:
En Postman, guarda la cookie de sesión que se recibe (si la respuesta la incluye) para las siguientes solicitudes. También puedes usar la sección Cookies de Postman para ver y gestionar la cookie de sesión.

3. Obtener Perfil
Método: GET
URL: http://localhost:3000/api/v1/users/me
Headers (opcional):
Cookie: session_id=<valor-de-la-cookie>
Descripción:
Devuelve la información del usuario autenticado en la sesión actual.
Respuesta Exitosa (200 OK):
json

{
  "name": "Nombre del usuario",
  "email": "usuario@example.com",
  "office": "Oficina X"
}
Nota:
Asegúrate de incluir la cookie de sesión que se estableció durante el login. De lo contrario, recibirás un error 401.

4. Crear Incidencia (con archivo)
Método: POST
URL: http://localhost:3000/api/v1/incidents
Headers (opcional):
Cookie: session_id=<valor-de-la-cookie>
Body (form-data):
Campos de texto:
title: Título de la incidencia
description: Descripción de la incidencia
Archivos:
Key: files (selecciona File en lugar de Text)
Adjunta uno o más archivos
Descripción:
Crea una nueva incidencia y permite adjuntar archivos usando multer.
Respuesta Exitosa (201 Created):
json

{
  "message": "Incident created successfully",
  "incident": {
    "title": "Título de la incidencia",
    "description": "Descripción de la incidencia",
    "files": ["uploads/ejemplo.txt", ...],
    ...
  },
  "id": "ID_de_la_incidencia"
}

5. Obtener Todas las Incidencias
Método: GET
URL: http://localhost:3000/api/v1/incidents
Headers (opcional):
Cookie: session_id=<valor-de-la-cookie>
Descripción:
Retorna un array con todas las incidencias almacenadas en la base de datos.
Respuesta Exitosa (200 OK):
json

[
  {
    "title": "Título",
    "description": "Descripción",
    "files": [...],
    ...
  },
  ...
]

6. Obtener Detalle de Incidencia
Método: GET
URL: http://localhost:3000/api/v1/incidents/:id
Headers (opcional):
Cookie: session_id=<valor-de-la-cookie>
Descripción:
Retorna los datos detallados de la incidencia con el ID especificado.
Respuesta Exitosa (200 OK):
json

{
  "title": "Título",
  "description": "Descripción",
  "files": [...],
  ...
}

7. Editar Incidencia
Método: PATCH
URL: http://localhost:3000/api/v1/incidents/:id
Headers (opcional):
Content-Type: application/json
Cookie: session_id=<valor-de-la-cookie>
Body (raw, JSON):
json

{
  "title": "Título actualizado",
  "description": "Descripción actualizada",
  "status": "Resolved",
  "priority": "Alta"
}

Descripción:
Actualiza los campos de la incidencia. No incluye la lógica de adjuntar o eliminar archivos (ver endpoints específicos más abajo).
Respuesta Exitosa (200 OK):
json

{
  "message": "Incident updated successfully",
  "incident": {
    "title": "Título actualizado",
    "description": "Descripción actualizada",
    ...
  }
}

8. Añadir Archivo a la Incidencia
Método: PATCH
URL: http://localhost:3000/api/v1/incidents/:id/files
Headers (opcional):
Cookie: session_id=<valor-de-la-cookie>
Body (form-data):
Key: files (selecciona File), adjunta uno o varios archivos
Descripción:
Añade archivos a una incidencia existente sin reemplazar los ya adjuntos.
Respuesta Exitosa (200 OK):
json

{
  "message": "Archivos añadidos correctamente",
  "incident": {
    "title": "Título",
    "description": "Descripción",
    "files": ["uploads/archivo1.pdf", "uploads/archivo2.png", ...],
    ...
  }
}

9. Eliminar Archivo de la Incidencia
Método: DELETE
URL: http://localhost:3000/api/v1/incidents/:id/files
Headers (opcional):
Content-Type: application/json
Cookie: session_id=<valor-de-la-cookie>
Body (raw, JSON):
json

{
  "filePath": "uploads/archivo2.png"
}

Descripción:
Elimina un archivo específico del array files de la incidencia y, opcionalmente, lo borra físicamente del sistema.
Respuesta Exitosa (200 OK):

json

{
  "message": "File removed successfully",
  "incident": {
    "title": "Título",
    "files": ["uploads/archivo1.pdf", ...],
    ...
  }
}

10. Descargar un Archivo Adjunto
Método: GET
URL: http://localhost:3000/uploads/<nombre-del-archivo>
Descripción:
Permite descargar un archivo adjunto desde la carpeta uploads.
(No requiere un endpoint adicional en Express, pues ya se configura con app.use('/uploads', express.static('uploads')) en app.js.)

11. Salir de Sesión
Método: DELETE
URL: http://localhost:3000/api/v1/sessions
Headers (opcional):
Cookie: session_id=<valor-de-la-cookie>
Descripción:
Cierra la sesión del usuario en el servidor, destruyendo req.session.
Respuesta Exitosa (204 No Content):
(Sin contenido en el cuerpo.)

12. Eliminar Incidencia
Método: DELETE
URL: http://localhost:3000/api/v1/incidents/:id
Headers (opcional):
Cookie: session_id=<valor-de-la-cookie>
Descripción:
Elimina la incidencia especificada por :id.
Respuesta Exitosa (200 OK):
json

{
  "message": "Incident deleted successfully"
}

Resumen de Pasos en Postman:

Crear Usuario: (POST /api/v1/users)
Iniciar Sesión: (POST /api/v1/sessions), guardar cookie de sesión.
Obtener Perfil: (GET /api/v1/users/me), usando la cookie de sesión.
Crear Incidencia (con archivo): (POST /api/v1/incidents) usando form-data con la key files.
Obtener Todas las Incidencias: (GET /api/v1/incidents).
Obtener Detalle de Incidencia: (GET /api/v1/incidents/:id).
Editar Incidencia: (PATCH /api/v1/incidents/:id).
Añadir Archivo a la Incidencia: (PATCH /api/v1/incidents/:id/files) usando form-data.
Eliminar Archivo de la Incidencia: (DELETE /api/v1/incidents/:id/files) enviando en el body el filePath.
Descargar un Archivo Adjunto: (GET /uploads/<nombre-archivo>).
Salir de Sesión: (DELETE /api/v1/sessions).
Eliminar Incidencia: (DELETE /api/v1/incidents/:id).