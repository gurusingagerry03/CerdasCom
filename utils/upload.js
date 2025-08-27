const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'public', 'uploads'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const storageFile = multer.diskStorage({
  destination: path.join(__dirname, '..', 'public', 'files'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });
const uploadFile = multer({ storage: storageFile });

module.exports = { upload, uploadFile };
