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

    // Validar que el rol sea uno de los predefinidos
    const validRoles = ["user", "admin", "tecnico"];
    if (!validRoles.includes(role)) {
        return res.status(400).json({ message: "El rol no es válido" });
    }

    // Validar que la oficina sea una de las predefinidas
    const validOffices = ["Malaga", "El Palo", "Fuengirola"];
    if (!validOffices.includes(office)) {
        return res.status(400).json({ message: "La oficina no es válida" });
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
    role: { type: String, enum: ["user", "admin", "tecnico"], default: "user" },

    office: {
      type: String,
      required: [true, "Office is required"],
      enum: ["Malaga", "El Palo", "Fuengirola"],
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

// Ruta para crear un usuario
router.post("/", usersController.register);

// Ruta para obtener el perfil del usuario
router.get("/me", sessionMiddleware, usersController.profile);

// Ruta para obtener todos los usuarios
router.get("/", usersController.getAllUsers);

module.exports = router;

```

# Pruebas con Postman

Utiliza Postman para verificar el correcto funcionamiento de la API de HelpDesk Fuxiona. Asegúrate de configurar el entorno en Postman para que la variable de entorno `baseUrl` esté definida como:

```
http://localhost:3000/api/v1
```

## 1. Crear un Nuevo Usuario
- **Método:** POST
- **URL:** `{{baseUrl}}/users`
- **Headers:**
  - Content-Type: application/json
- **Body (raw, JSON):**
```json
{
  "name": "Nombre del usuario",
  "email": "usuario@example.com",
  "password": "contraseñaSegura",
  "office": "Oficina X"
}
```
- **Descripción:** Crea un nuevo usuario en la base de datos.
- **Respuesta Esperada:** Código 201 y un mensaje de confirmación.

## 2. Inicio de Sesión
- **Método:** POST
- **URL:** `{{baseUrl}}/sessions`
- **Headers:**
  - Content-Type: application/json
- **Body (raw, JSON):**
```json
{
  "email": "usuario@example.com",
  "password": "contraseñaSegura"
}
```
- **Descripción:** Inicia sesión y establece la sesión del usuario.
- **Respuesta Esperada:** Código 200 y un mensaje "Inicio de sesión exitoso".
- **Nota:** Guarda la cookie de sesión generada (usa el Cookie Manager de Postman) para autenticar las siguientes solicitudes.

## 3. Obtener el Perfil del Usuario
- **Método:** GET
- **URL:** `{{baseUrl}}/users/me`
- **Headers:** Asegúrate de incluir la cookie de sesión.
- **Descripción:** Devuelve la información del usuario autenticado.
- **Respuesta Esperada:**
```json
{
  "name": "Nombre del usuario",
  "email": "usuario@example.com",
  "office": "Oficina X"
}
```

## 4. Obtener Todos los Usuarios
- **Método:** GET
- **URL:** `{{baseUrl}}/users`
- **Descripción:** Devuelve un array con todos los usuarios.
- **Respuesta Esperada:** Código 200 y un array de usuarios.

## 5. Crear una Nueva Incidencia con Archivos
- **Método:** POST
- **URL:** `{{baseUrl}}/incidents`
- **Headers:** Asegúrate de incluir la cookie de sesión.
- **Body:** Selecciona form-data.
  - **Campos de texto:**
    - title: Ej. "Título de la incidencia"
    - description: Ej. "Descripción de la incidencia"
    - priority (opcional): Ej. "Alta"
  - **Campo de archivo:**
    - Key: files (tipo File) — Adjunta uno o varios archivos (png, txt, pdf, etc.).
- **Descripción:** Crea una incidencia y sube los archivos a Cloudinary. Las respuestas incluirán un array files con objetos que contienen url y public_id.
- **Respuesta Esperada:** Código 201 y un objeto JSON con la incidencia creada.

## 6. Obtener Todas las Incidencias
- **Método:** GET
- **URL:** `{{baseUrl}}/incidents`
- **Headers:** Incluye la cookie de sesión.
- **Descripción:** Devuelve un array con todas las incidencias.
- **Respuesta Esperada:** Código 200 y un array de incidencias.

## 7. Obtener Detalles de una Incidencia
- **Método:** GET
- **URL:** `{{baseUrl}}/incidents/:id`
- **Headers:** Incluye la cookie de sesión.
- **Descripción:** Devuelve los detalles de la incidencia especificada.
- **Respuesta Esperada:** Código 200 y un objeto JSON con la información de la incidencia.

## 8. Editar una Incidencia (sin Archivos)
- **Método:** PATCH
- **URL:** `{{baseUrl}}/incidents/:id`
- **Headers:**
  - Content-Type: application/json
  - Incluye la cookie de sesión.
- **Body (raw, JSON):**
```json
{
  "title": "Título actualizado",
  "description": "Descripción actualizada",
  "status": "Resolved",
  "priority": "Alta"
}
```
- **Descripción:** Actualiza la información de la incidencia.
- **Respuesta Esperada:** Código 200 y la incidencia actualizada.

## 9. Añadir Archivo a una Incidencia Existente
- **Método:** PATCH
- **URL:** `{{baseUrl}}/incidents/:id/files`
- **Headers:** Incluye la cookie de sesión.
- **Body:** Selecciona form-data.
  - **Campo de archivo:**
    - Key: files (tipo File) — Adjunta uno o varios archivos.
- **Descripción:** Añade nuevos archivos a la incidencia, subiéndolos a Cloudinary y almacenando sus URLs y public_id en el campo files.
- **Respuesta Esperada:** Código 200 y la incidencia actualizada.

## 10. Eliminar Archivo de una Incidencia y de Cloudinary
- **Método:** DELETE
- **URL:** `{{baseUrl}}/incidents/:id/files`
- **Headers:**
  - Content-Type: application/json
  - Incluye la cookie de sesión.
- **Body (raw, JSON):**
```json
{
  "public_id": "public_id_del_archivo_a_eliminar"
}
```
- **Descripción:** Elimina la referencia del archivo del array files de la incidencia y elimina el archivo de Cloudinary usando su public_id.
- **Respuesta Esperada:** Código 200 con un mensaje confirmando la eliminación y la incidencia actualizada.

## 11. Descargar un Archivo Adjunto
- **Método:** GET
- **URL:** `http://localhost:3000/uploads/{nombre_del_archivo}`
- **Descripción:** Permite descargar un archivo adjunto directamente desde Cloudinary.
- **Respuesta Esperada:** El navegador iniciará la descarga del archivo.

## 12. Cerrar Sesión
- **Método:** DELETE
- **URL:** `{{baseUrl}}/sessions`
- **Headers:** Incluye la cookie de sesión.
- **Descripción:** Cierra la sesión del usuario y elimina la cookie de sesión.
- **Respuesta Esperada:** Código 204 (sin contenido).

## 13. Eliminar una Incidencia
- **Método:** DELETE
- **URL:** `{{baseUrl}}/incidents/:id`
- **Headers:** Incluye la cookie de sesión.
- **Descripción:** Elimina la incidencia especificada.
- **Respuesta Esperada:** Código 200 y un mensaje confirmando la eliminación.

## Pasos Generales:
- Configura el entorno en Postman con la variable `baseUrl` y asegúrate de capturar y enviar la cookie de sesión en cada solicitud protegida.
- Realiza las solicitudes en el orden indicado:
  - Crear usuario → Iniciar sesión → Obtener perfil.
  - Crear incidencia con archivos → Verificar incidencias.
  - Editar incidencia → Añadir y eliminar archivos.
  - Descargar archivo → Cerrar sesión.
- Verifica las respuestas y confirma que los archivos se suben a Cloudinary, que las incidencias se actualizan correctamente y que, al eliminar un archivo, éste se borra de Cloudinary.
