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
  status: { type: String, default: "Pendiente", enum: ["Pendiente", "En Progreso", "Resuelto"] },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Incident", incidentSchema);
