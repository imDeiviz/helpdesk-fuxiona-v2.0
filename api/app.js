require("dotenv").config();

const express = require("express");
const logger = require("morgan");
const cors = require("./middlewares/cors.middleware");
const session = require("express-session");
const MongoStore = require("connect-mongo");

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
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Cambiar a true en producción si se usa HTTPS
      maxAge: 24 * 60 * 60 * 1000 // La sesión expirará después de 24 horas
    }
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
app.use(express.static("dist")); // Servir archivos estáticos de la carpeta dist
app.use("/uploads", express.static("uploads"));

const path = require("path"); // Importar el módulo path

/* API Routes Configuration */
const routesConfig = require("./config/routes.config");
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html")); // Servir el archivo index.html
});

app.use("/api/v1", routesConfig);

/* Manejo de errores */
app.use((err, req, res, next) => {
  console.error(err); // Registrar el error para facilitar la depuración
  res.status(err.status || 500).json({
    message: "Error interno del servidor", // No exponer detalles del error
  });
});

const port = Number(process.env.PORT || 3000); // Cambiar a 80 en producción


app.listen(port, () => console.info(`Application running at port ${port}`));

module.exports = app;
