import { body, param } from "express-validator";

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
