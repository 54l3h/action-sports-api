import { Router } from "express";
import * as subCategoryValidationSchema from "./subCategory.validation.schema.js";
import validationMiddleware from "../../middlewares/validation.middleware.js";
import * as subCategoryService from "./services/index.js";
import { uploadSingleImage } from "../../middlewares/upload.middleware.js";
import { authenticationMiddleware } from "../../middlewares/authentication.middleware.js";
import { authorizationMiddleware } from "../../middlewares/authorization.middleware.js";
import { UserRoles } from "../../models/user.model.js";

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
    authenticationMiddleware,
    authorizationMiddleware(UserRoles.ADMIN),
    uploadSingleImage("image"),
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
    authenticationMiddleware,
    authorizationMiddleware(UserRoles.ADMIN),
    uploadSingleImage("image"),
    subCategoryValidationSchema.updateSubCategory,
    validationMiddleware,
    subCategoryService.updateSubCategory
  )
  .delete(
    authenticationMiddleware,
    authorizationMiddleware(UserRoles.ADMIN),
    subCategoryValidationSchema.deleteSubCategory,
    validationMiddleware,
    subCategoryService.deleteSubCategory
  );

export default router;
