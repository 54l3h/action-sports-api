import { Router } from "express";
import validationMiddleware from "../../middlewares/validation.middleware.js";
import * as categoryValidationSchema from "../category.validation.schema.js";
import * as categoryService from "./services/index.js";

const router = new Router();

router
  .route("")
  .get(categoryService.getCategories)
  .post(
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
