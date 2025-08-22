import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Set up storage engine
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function(req, file, cb) {
    cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
  }
});

// Check file type
function checkFileType(file, cb) {
  // Allowed extensions
  const filetypes = /jpeg|jpg|png|gif|mp4|mov|avi|mkv/;
  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime type
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Invalid file type!');
  }
}

// Init upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 200000000 }, // 200 MB limit
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  }
});

export default upload;