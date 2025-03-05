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
    const { role, office } = req.user; // Extraer datos del usuario autenticado
    let incidents;

    if (role === 'admin') {
      incidents = await Incident.find(); // Administradores ven todas las incidencias
    } else {
      incidents = await Incident.find({ office }); // Usuarios ven solo las incidencias de su oficina
    }

    res.status(200).json(incidents); 
  } catch (error) {
    next(createError(500, "Error retrieving incidents"));
  }
};

module.exports.create = async (req, res, next) => {
  try {
    const { title, description, priority, status } = req.body;

    const { office, name, email } = req.user; // Extraer datos del usuario autenticado

    // Validar que se proporcionen título y descripción
    if (!title || !description) {
      return next(createError(400, "El título y la descripción son obligatorios"));
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
      status: status || "Pendiente", // Se asigna estado por defecto si no se envía
    };

    const newIncident = new Incident(newIncidentData);
    await newIncident.save().catch(err => next(createError(500, "Error al crear la incidencia")));

    res.status(201).json({
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
      return res.status(400).json({
        message: "El public_id es requerido para eliminar el archivo",
      });
    }

    // Eliminar la referencia del archivo del array 'files' de la incidencia

    const updatedIncident = await Incident.findById(id);

    const fileToDelete = updatedIncident.files.find(
      (file) => file.public_id === public_id
    );

    if (!fileToDelete) {
      return res.status(404).json({ message: "Archivo no encontrado en la incidencia" });
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
      return res.status(500).json({
        message: "No se pudo eliminar el archivo en Cloudinary",
        result,
      });
    }

    res.status(200).json({
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
      return next(createError(400, "No se ha enviado ningún archivo"));
    }

    // Almacenar las URLs de Cloudinary en lugar de las rutas locales
    const newFiles = await Promise.all(
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

    const updatedIncident = await Incident.findByIdAndUpdate(id, { $push: { files: { $each: newFiles } } }, { new: true }).catch(err => next(createError(500, "Error al actualizar la incidencia")));

    if (!updatedIncident) {
      return res.status(404).json({ message: "Incidencia no encontrada" });
    }

    res.status(200).json({
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
    const { role, office } = req.user; // Extraer datos del usuario autenticado

    const incident = await Incident.findById(id);
    if (!incident) {
      throw createError(404, "Incident not found");
    }

    if (role !== 'admin' && incident.office !== office) { 
      return next(createError(403, "No tienes permiso para acceder a esta incidencia")); // Verificar acceso 
    }

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

    res.status(200).json({
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

    const updatedIncident = await Incident.findByIdAndUpdate(id, {
      ...(updateData.status && req.user.role !== 'user' && { status: updateData.status }),
      ...(updateData.title && { title: updateData.title }),
      ...(updateData.description && { description: updateData.description }),
      ...(updateData.priority && { priority: updateData.priority }),
    }, {
      new: true,
    });

    if (!updatedIncident) {
      throw createError(404, "Incident not found");
    }

    res.status(200).json({
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
    const incidentToDelete = await Incident.findById(id);

    if (!incidentToDelete) {
      throw createError(404, "Incident not found");
    }

    // Eliminar todos los archivos adjuntos de Cloudinary, incluyendo PNG

    await Promise.all(
      incidentToDelete.files.map(async (file) => {
        const config = EXTENSIONS_RAW.includes(file.public_id.split(".").pop())
          ? { resource_type: "raw" }
          : {};
        await cloudinary.uploader.destroy(file.public_id, {
          invalidate: true,
          ...config,
        });
      })
    );

    // Ahora eliminar la incidencia
    const deletedIncident = await Incident.findByIdAndDelete(id);
    
    if (!deletedIncident) {
      throw createError(404, "Incident not found");
    }

    res.status(200).json({ message: "Incident deleted successfully" });
  } catch (error) {
    next(error);
  }
};
