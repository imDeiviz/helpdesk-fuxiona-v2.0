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
const { title, description, priority } = req.body;

    const { office, name, email } = req.user; // Extraer datos del usuario autenticado

    // Validar que se proporcionen título y descripción
    if (!title || !description) {
      throw createError(400, "El título y la descripción son obligatorios");
    }

    // Procesar archivos subidos (si existen)
    let files = [];
    if (req.files && req.files.length) {
      files = req.files.map(file => file.path); 
    }
    console.log(files);

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
    console.log(newIncidentData);

    const newIncident = new Incident(newIncidentData);
    await newIncident.save();

    res.status(201).json({ message: "Incident created successfully", incident: newIncident, id: newIncident._id });
  } catch (error) {
    next(error);
  }
};

module.exports.removeFile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { filePath } = req.body; // Ruta del archivo a eliminar

    // Actualizar la incidencia para eliminar el archivo del array files
    const updatedIncident = await Incident.findByIdAndUpdate(
      id,
      { $pull: { files: filePath } },
      { new: true }
    );

    if (!updatedIncident) {
      throw createError(404, "Incident not found");
    }

    // Opcional: Eliminar el archivo del sistema
    const fs = require('fs');
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Error al eliminar el archivo:", err);
      }
    });

    res.status(200).json({ message: "File removed successfully", incident: updatedIncident });
  } catch (error) {
    next(error);
  }
};

module.exports.addFiles = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No se ha enviado ningún archivo" });
    }
    
    const newFiles = req.files.map(file => file.path);
    
    const updatedIncident = await Incident.findByIdAndUpdate(
      id,
      { $push: { files: { $each: newFiles } } },
      { new: true }
    );
    
    if (!updatedIncident) {
      return res.status(404).json({ message: "Incidencia no encontrada" });
    }
    
    res.status(200).json({ message: "Archivos añadidos correctamente", incident: updatedIncident });
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
const { title, description, status, priority } = req.body;


    // Actualizar solo los campos que se proporcionan
    const updatedIncident = await Incident.findByIdAndUpdate(id, { 
      ...(title && { title }), 
      ...(description && { description }), 
      ...(status && { status }),
      ...(priority && { priority }) 

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
