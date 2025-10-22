import { body, param, query } from "express-validator";

export const createCategory = [
  body("name")
    .exists({ checkFalsy: true })
    .withMessage("Name is required")
    .isString()
    .withMessage("Name must be a string")
    .isLength({ min: 3, max: 32 })
    .withMessage("Name must be between 3 and 32 characters long"),
];

export const getCategory = [
  param("id").isMongoId().withMessage("Invalid category ID"),
];

export const getCategories = [
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

export const updateCategory = [
  param("id").isMongoId().withMessage("Invalid category ID"),
  body("name")
    .optional()
    .isString()
    .withMessage("Name must be a string")
    .isLength({ min: 3, max: 32 })
    .withMessage("Name must be between 3 and 32 characters long"),
];

export const deleteCategory = [
  param("id").isMongoId().withMessage("Invalid category ID"),
];
