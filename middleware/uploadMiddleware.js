import multer from 'multer';
import path from 'path';

// ✅ Configure Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });

// ✅ File Type Validation
const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type! Only JPG, PNG, and JPEG are allowed."), false);
    }
  };
  

export const upload = multer({ storage, fileFilter });
