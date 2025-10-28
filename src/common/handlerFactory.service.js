import asyncHandler from "express-async-handler";
import AppError from "../utils/AppError.js";
import slugify from "slugify";
import { isValidObjectId } from "mongoose";
import cloud from "../config/cloudinary.js";
// import { uploadImageToCloudinary } from "../utils/uploadImageToCloudinary.js";

export const deleteOne = (Model) => {
  return asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const document = await Model.findByIdAndDelete(id); // no { new: true } needed

    if (!document) {
      throw new AppError(`${Model.modelName} not found`, 404);
    }

    return res.status(200).json({
      success: true,
      message: `${Model.modelName} deleted successfully`,
      data: document,
    });
  });
};

export const updateOne = (Model) => {
  return asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { name } = req.body;

    const document = await Model.findByIdAndUpdate(
      id,
      { name, slug: slugify(name) },
      { new: true }
    );
    if (!document) {
      throw new AppError(`${Model.modelName} not found`, 404);
    }

    return res.status(200).json({
      success: true,
      message: `${Model.modelName} updated successfully`,
      data: document,
    });
  });
};

export const createOne = (Model) => {
  return asyncHandler(async (req, res, next) => {
    const { name, description } = req.body;
    const file = req.file;

    if (!name) return next(new AppError("Name is required", 400));
    if (!description) return next(new AppError("Description is required", 400));
    if (!file) return next(new AppError("Image is required", 400));

    // Start ----------------------

    // Build data URI
    const dataUri = `data:${file.mimetype};base64,${file.buffer.toString(
      "base64"
    )}`;
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const publicId = `${file.fieldname}-${uniqueSuffix}`;

    // Upload to Cloudinary
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
      // Cloudinary errors (network, auth, etc.)
      return next(err);
    }

    const { secure_url, public_id } = uploadResult;

    // Check duplicate name in DB — if duplicate, remove cloud image to avoid orphan
    const existing = await Model.findOne({ name });
    if (existing) {
      try {
        await cloud.uploader.destroy(public_id);
      } catch (delErr) {
        console.warn("Failed to delete duplicate upload:", delErr);
      }
      return next(new AppError(`${Model.modelName} already exists`, 409));
    }

    // End ----------------------

    // Create DB doc
    const document = await Model.create({
      name,
      description,
      slug: slugify(name, { lower: true }),
      image: { secure_url, public_id },
    });

    if (!document) {
      // cleanup on failure
      try {
        await cloud.uploader.destroy(public_id);
      } catch (delErr) {
        console.warn("failed to cleanup cloud image after DB failure:", delErr);
      }
      return next(new AppError(`Unable to create ${Model.modelName}`, 500));
    }

    return res.status(201).json({
      success: true,
      message: `${Model.modelName} created successfully`,
      data: document,
    });
  });
};

export const getOne = (Model) => {
  return asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      throw new AppError(`Invalid ${Model.modelName} id`, 400);
    }
    const document = await Model.findById(id);
    if (!document) {
      throw new AppError(`${Model.modelName} not found`, 404);
    }
    return res.status(200).json({
      success: true,
      message: `${Model.modelName} retrieved successfully`,
      data: {
        [Model.modelName.toLowerCase()]: document,
      },
    });
  });
};

export const getAll = (Model) => {
  return asyncHandler(async (req, res, next) => {
    const { page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const total = await Model.countDocuments();
    const documents = await Model.find({}).skip(skip).limit(Number(limit));

    return res.status(200).json({
      success: true,
      message:
        documents.length === 0
          ? "No documents found"
          : "Documents retrieved successfully",
      data: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalResults: total,
        results: documents.length,
        documents,
      },
    });
  });
};
