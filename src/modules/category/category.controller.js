import { Router } from "express";
import validationMiddleware from "../../middlewares/validation.middleware.js";
import * as categoryValidationSchema from "./category.validation.schema.js";
import * as categoryService from "./services/index.js";
import subCategoryController from "../subcategory/subCategory.controller.js";
import { uploadCategoryImage } from "./services/uploadCategoryImage.service.js";
import { resizeImage } from "./services/resizeImage.service.js";

const router = Router();

// Mount nested subcategory routes here so you get:
// /api/categories/:categoryId/subcategories
router.use("/:categoryId/subcategories", subCategoryController);

// NOTE: Do NOT also mount "/subcategories" here — that would create
// /api/categories/subcategories (no categoryId) which is confusing.
// If you want a top-level /api/subcategories route, mount it in server.js.

router.route("/").get(categoryService.getCategories).post(
  uploadCategoryImage,
  resizeImage,
  categoryValidationSchema.createCategory,
  validationMiddleware,
  categoryService.createCategory
);

router
  .route("/:id")
  .get(
    categoryValidationSchema.getCategory,
    validationMiddleware,
    categoryService.getCategoryById
  )
  .patch(
    categoryValidationSchema.updateCategory,
    validationMiddleware,
    categoryService.updateCategory
  )
  .delete(
    categoryValidationSchema.deleteCategory,
    validationMiddleware,
    categoryService.deleteCategory
  );

export default router;
