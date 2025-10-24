import asyncHandler from "express-async-handler";
import AppError from "../utils/AppError.js";
import slugify from "slugify";
import { isValidObjectId } from "mongoose";

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
    const { name } = req.body;

    const existingDocument = await Model.findOne({ name });
    if (existingDocument) {
      throw new AppError(`${Model.modelName} already exists`, 409);
    }

    const document = await Model.create({
      name,
      slug: slugify(name),
    });

    if (!document) {
      throw new AppError(`Unable to create ${Model.modelName}`, 500);
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
