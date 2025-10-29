import multer from "multer";
import AppError from "../utils/AppError.js";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file && file.mimetype && file.mimetype.startsWith("image"))
    return cb(null, true);
  cb(new AppError("Images only are allowed", 400), false);
};

export const uploadSingleImage = (fieldName = "image") =>
  multer({ storage, fileFilter, limits: { fileSize: MAX_FILE_SIZE } }).single(
    fieldName
  );

export const uploadMultipleImages = (fieldName = "images") =>
  multer({ storage, fileFilter, limits: { fileSize: MAX_FILE_SIZE } }).array(
    fieldName
  );
