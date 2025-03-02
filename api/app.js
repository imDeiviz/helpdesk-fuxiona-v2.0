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
    cookie: { 
      secure: false, // Asegúrate de que 'secure' esté en 'false' si estás desarrollando en localhost sin HTTPS
      maxAge: null // La sesión no expirará hasta que se cierre el navegador
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
