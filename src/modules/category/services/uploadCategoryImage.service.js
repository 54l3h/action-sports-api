import multer from "multer";
import path from "node:path";
import AppError from "../../../utils/AppError.js";

// Disk storage
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/categories");
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     const filename =
//       file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname);
//     cb(null, filename);
//   },
// });

// Memory storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Images only are allowed", 409), false);
  }
};

const upload = multer({ storage, fileFilter });

export const uploadCategoryImage = upload.single("image");
