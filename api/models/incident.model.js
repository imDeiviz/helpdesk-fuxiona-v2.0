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
    creationDate: {
        type: Date,
        default: Date.now,
    },

      type: String,
      enum: ["Pending", "Resolved"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

const Incident = mongoose.model("Incident", incidentSchema);
module.exports = Incident;
