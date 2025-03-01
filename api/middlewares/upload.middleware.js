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
