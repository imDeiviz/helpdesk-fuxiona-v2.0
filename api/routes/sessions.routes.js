const express = require("express");
const router = express.Router();
const sessionsController = require("../controllers/sessions.controller");

router.post("/", sessionsController.create);
router.delete("/", sessionsController.destroy);

module.exports = router;
