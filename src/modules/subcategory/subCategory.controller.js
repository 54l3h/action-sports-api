import { Router } from "express";
import * as subCategoryValidationSchema from "./subCategory.validation.schema.js";
import validationMiddleware from "../../middlewares/validation.middleware.js";
import * as subCategoryService from "./services/index.js";

const router = Router({ mergeParams: true });

/**
 * / (relative)
 * - GET  => getSubCategories (handles both: all subcategories OR by categoryId when provided)
 * - POST => createSubCategory (requires categoryId when nested)
 */
router
  .route("/")
  .get(
    subCategoryValidationSchema.getSubCategories, // optional categoryId + page/limit checks
    validationMiddleware,
    subCategoryService.getSubCategories
  )
  .post(
    subCategoryValidationSchema.createSubCategory,
    validationMiddleware,
    subCategoryService.createSubCategory
  );

/**
 * /:subcategoryId (relative)
 * - GET    => get a single subcategory
 * - PATCH  => update a subcategory
 * - DELETE => delete a subcategory
 */
router
  .route("/:subcategoryId")
  .get(
    subCategoryValidationSchema.getSubCategory, // validate subcategoryId param
    validationMiddleware,
    subCategoryService.getSubCategory
  )
  .patch(
    subCategoryValidationSchema.updateSubCategory,
    validationMiddleware,
    subCategoryService.updateSubCategory
  )
  .delete(
    subCategoryValidationSchema.deleteSubCategory,
    validationMiddleware,
    subCategoryService.deleteSubCategory
  );

export default router;
