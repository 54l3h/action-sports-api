import cloud from "../config/cloudinary.js";

export const uploadImageToCloudinary = async (Model, name, file, next) => {
  const dataUri = `data:${file.mimetype};base64,${file.buffer.toString(
    "base64"
  )}`;
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const publicId = `${file.fieldname}-${uniqueSuffix}`;

  let uploadResult;
  try {
    uploadResult = await cloud.uploader.upload(dataUri, {
      folder: `${process.env.CLOUDINARY_FOLDER || "uploads"}/${
        Model.modelName
      }`,
      public_id: publicId,
      resource_type: "image",
      overwrite: false,
    });
  } catch (err) {
    return next(err);
  }

  const { secure_url, public_id } = uploadResult;

  const existing = await Model.findOne({ name });
  if (existing) {
    try {
      await cloud.uploader.destroy(public_id);
    } catch (delErr) {
      console.warn("Failed to delete duplicate upload:", delErr);
    }
    return next(new AppError(`${Model.modelName} already exists`, 409));
  }

  return { secure_url, publicId };
};
