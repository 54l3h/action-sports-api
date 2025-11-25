import asyncHandler from "express-async-handler";
import Banner from "../../models/banner.model.js";
import AppError from "../../utils/AppError.js";
import cloud from "../../config/cloudinary.js";

export const addBanner = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!req.file) {
    throw new AppError("Image is required", 400);
  }

  const file = req.file;

  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const publicId = `${file.fieldname}-${uniqueSuffix}`;

  let uploadResult;
  try {
    uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloud.uploader.upload_stream(
        {
          folder: `${process.env.CLOUDINARY_FOLDER}/uploads/banners`,
          public_id: publicId,
          resource_type: "image",
          overwrite: false,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(file.buffer);
    });
  } catch (err) {
    throw new AppError("Failed to upload image to Cloudinary", 500);
  }

  const { secure_url, public_id } = uploadResult;

  const banner = await Banner.create({
    image: {
      secure_url,
      public_id,
    },
    title,
    description,
  });

  res.status(201).json({
    success: true,
    message: "Banner added successfully",
    data: banner,
  });
});

export const updateBanner = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { description, title } = req.body;

  const banner = await Banner.findById(id);
  if (!banner) throw new AppError("Banner not found", 404);

  if (req.file) {
    const file = req.file;

    if (banner.image?.public_id) {
      try {
        await cloud.uploader.destroy(banner.image.public_id);
      } catch (err) {
        console.warn("Failed to delete old image from Cloudinary:", err);
      }
    }

    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const publicId = `${file.fieldname}-${uniqueSuffix}`;

    let uploadResult;
    try {
      uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloud.uploader.upload_stream(
          {
            folder: `${process.env.CLOUDINARY_FOLDER}/uploads/banners`,
            public_id: publicId,
            resource_type: "image",
            overwrite: false,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        uploadStream.end(file.buffer);
      });
    } catch (err) {
      throw new AppError("Failed to upload new image to Cloudinary", 500);
    }

    banner.image = {
      secure_url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
    };
  }

  if (title !== undefined) banner.title = title;
  if (description !== undefined) banner.description = description;

  await banner.save();

  res.status(200).json({
    success: true,
    message: "Banner updated successfully",
    data: banner,
  });
});

export const deleteBanner = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const banner = await Banner.findByIdAndDelete(id);
  if (!banner) throw new AppError("Banner not found", 404);

  res.status(200).json({
    success: true,
    message: "Banner deleted successfully",
  });
});

export const getAllBanners = asyncHandler(async (req, res) => {
  const banners = await Banner.find();
  res.status(200).json({
    success: true,
    message: "Banners retrieved successfully",
    data: banners,
  });
});

export const getBannerById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const banner = await Banner.findById(id);
  if (!banner) throw new AppError("Banner not found", 404);
  res.status(200).json({ success: true, data: banner });
});
