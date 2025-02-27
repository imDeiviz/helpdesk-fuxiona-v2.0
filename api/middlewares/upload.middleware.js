const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
filename: (req, file, cb) => {
    cb(null, file.originalname); 

  }
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = /txt|png|pdf|zip|rar/;
  const extension = file.originalname.split('.').pop().toLowerCase();
  if (allowedExtensions.test(extension)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido'), false);
  }
};

const upload = multer({ storage, fileFilter });
module.exports = upload;
