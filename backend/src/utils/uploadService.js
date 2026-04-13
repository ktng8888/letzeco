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
    const folder = req.admin?.id
      ? 'uploads/profiles/admins/'
      : 'uploads/profiles/users/';
    createFolderIfNotExists(folder);
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    // filename: role_Id_timestamp.extension
    const ext = path.extname(file.originalname);
        if (req.admin?.id) {
      cb(null, `admin_${req.admin.id}_${Date.now()}${ext}`);
    } else {
      cb(null, `user_${req.user.id}_${Date.now()}${ext}`);
    }
  }
});

const categoryStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = 'uploads/categories/';
    createFolderIfNotExists(folder);
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `category_${Date.now()}${ext}`);
  }
});

const actionStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = 'uploads/actions/';
    createFolderIfNotExists(folder);
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `action_${Date.now()}${ext}`);
  }
});

const challengeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = 'uploads/challenges/';
    createFolderIfNotExists(folder);
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `challenge_${Date.now()}${ext}`);
  }
});

const badgeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = 'uploads/badges/';
    createFolderIfNotExists(folder);
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `badge_${Date.now()}${ext}`);
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
  limits: { fileSize: 5 * 1024 * 1024 }
});

const uploadCategory = multer({
  storage: categoryStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

const uploadAction = multer({
  storage: actionStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

const uploadChallenge = multer({
  storage: challengeStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

const uploadBadge = multer({
  storage: badgeStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

const uploadProof = multer({
  storage: proofStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});

const deleteFile = (filePath) => {
  if (!filePath) return;
  const fullPath = path.join(__dirname, '../../', filePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

module.exports = {
  uploadProfile,
  uploadCategory,
  uploadAction,
  uploadChallenge,
  uploadBadge,
  uploadProof,
  deleteFile
};
