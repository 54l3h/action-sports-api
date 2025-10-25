import sharp from "sharp";

export const resizeImage = async (req, res, next) => {
  const { file } = req;
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const filename = file.fieldname + "-" + uniqueSuffix + ".jpeg";
  await sharp(file.buffer)
    .resize(600, 600)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`uploads/categories/${filename}`);
  next();
};
