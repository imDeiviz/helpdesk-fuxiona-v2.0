const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Configurar Cloudinary con las credenciales del entorno
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configurar el almacenamiento en Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    resource_type: "auto",
    folder: 'helpdesk-uploads',
    allowedFormats: ['jpg', 'png', 'gif', 'mp4', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'zip', 'rar'],
  },
});

// Crear el middleware multer con el storage de Cloudinary
const upload = multer({ 
  storage, 
  limits: { 
    fileSize: 10 * 1024 * 1024 // Limitar el tamaño del archivo a 10 MB
  }
});

module.exports = upload;
