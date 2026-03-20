const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Make sure upload folders exist
const createFolderIfNotExists = (folder) => {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }
};

// Profile picture upload
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = 'uploads/profiles/';
    createFolderIfNotExists(folder);
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    // filename: userId_timestamp.extension
    const ext = path.extname(file.originalname);
    cb(null, `user_${req.user.id}_${Date.now()}${ext}`);
  }
});

// Proof photo upload
const proofStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = 'uploads/proofs/';
    createFolderIfNotExists(folder);
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `proof_${req.user.id}_${Date.now()}${ext}`);
  }
});

// Only allow image files
const imageFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG and PNG images are allowed.'), false);
  }
};

const uploadProfile = multer({
  storage: profileStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

const uploadProof = multer({
  storage: proofStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

module.exports = { uploadProfile, uploadProof };