import { body, param, query } from "express-validator";

export const createBrand = [
  body("name")
    .exists({ checkFalsy: true })
    .withMessage("Name is required")
    .isString()
    .withMessage("Name must be a string")
    .isLength({ min: 2, max: 32 })
    .withMessage("Name must be between 2 and 32 characters long"),
];

export const getBrand = [
  param("id").isMongoId().withMessage("Invalid brand ID"),
];

export const getBrands = [
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

export const updateBrand = [
  param("id").isMongoId().withMessage("Invalid brand ID"),
  body("name")
    .optional()
    .isString()
    .withMessage("Name must be a string")
    .isLength({ min: 2, max: 32 })
    .withMessage("Name must be between 2 and 32 characters long"),
];

export const deleteBrand = [
  param("id").isMongoId().withMessage("Invalid brand ID"),
];
