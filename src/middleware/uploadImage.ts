// src/uploadMiddleware.ts
import multer from "multer";
import { Request, Response, NextFunction } from "express";

// Konfigurasi penyimpanan file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Folder tujuan penyimpanan file
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + "-" + file.originalname);
  },
});

// Filter file yang diizinkan
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(new Error("Hanya file JPEG dan PNG yang diizinkan!"), false);
  }
};

// Konfigurasi multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5, // Batas ukuran file 5MB
  },
  fileFilter: fileFilter,
});

// Middleware untuk mengunggah satu file
const uploadSingle = upload.single("image");

// Middleware untuk mengunggah beberapa file
const uploadMultiple = upload.array("images", 10);

export { uploadSingle, uploadMultiple };
