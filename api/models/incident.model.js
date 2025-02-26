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
    priority: { type: String, enum: ["Alta", "Media", "Baja"], default: "Media" } // ✅ Nuevo campo agregado

  },
  {
    timestamps: true,
  }
);

const Incident = mongoose.model("Incident", incidentSchema);
module.exports = Incident;
