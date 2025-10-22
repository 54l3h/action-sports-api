import { body, param, query } from "express-validator";

export const createSubCategory = [
  body("name")
    .exists({ checkFalsy: true })
    .withMessage("Name is required")
    .isString()
    .withMessage("Name must be a string")
    .isLength({ min: 2, max: 32 })
    .withMessage("Name must be between 2 and 32 characters long"),
  param("categoryId").isMongoId().withMessage("Invalid category ID"),
];
// done

export const getSubCategory = [
  param("categoryId").optional().isMongoId().withMessage("Invalid category ID"),
  param("subcategoryId").isMongoId().withMessage("Invalid subcategory ID"),
];

export const getSubCategories = [
  // Only validate categoryId if it’s provided
  param("categoryId").optional().isMongoId().withMessage("Invalid category ID"),

  // Optional query validations (if you want)
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Limit must be a positive integer"),
];

export const updateSubCategory = [
  param("categoryId").optional().isMongoId().withMessage("Invalid categoryId"),
  param("subcategoryId").isMongoId().withMessage("Invalid subcategoryId"),
  body("name")
    .optional()
    .isString()
    .isLength({ min: 2, max: 32 })
    .withMessage("Name must be 2-32 chars"),
];

export const deleteSubCategory = [
  param("categoryId").optional().isMongoId().withMessage("Invalid categoryId"),
  param("subcategoryId").isMongoId().withMessage("Invalid subcategoryId"),
];
