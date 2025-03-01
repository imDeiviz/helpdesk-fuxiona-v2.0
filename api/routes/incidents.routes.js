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
