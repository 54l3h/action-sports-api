import { body, param, query } from "express-validator";

export const createProduct = [
  body("name")
    .exists({ checkFalsy: true })
    .withMessage("Name is required")
    .isString()
    .withMessage("Name must be a string")
    .isLength({ min: 3, max: 32 })
    .withMessage("Name must be between 3 and 32 characters long"),
  body("title")
    .exists({ checkFalsy: true })
    .withMessage("Title is required")
    .isString()
    .withMessage("Title must be a string")
    .isLength({ min: 8, max: 256 })
    .withMessage("Title must be between 8 and 256 characters long"),
  body("description")
    .exists({ checkFalsy: true })
    .withMessage("Product description is required")
    .isString()
    .withMessage("Product description must be a string")
    .isLength({ min: 24, max: 700 })
    .withMessage("Product description must be between 24 and 500 characters"),
  body("quantity")
    .exists({ checkFalsy: true })
    .withMessage("Product quantity is required")
    .isInt({ min: 1 })
    .withMessage("Quantity must be a positive integer"),
  body("price")
    .exists({ checkFalsy: true })
    .withMessage("Product price is required")
    .toFloat()
    .isFloat({ min: 1.0 })
    .withMessage("Price must be a positive number"),
  body("category").isMongoId().withMessage("Invalid category ID"),
  body("subcategory")
    .optional()
    .notEmpty()
    .isMongoId()
    .withMessage("Invalid subcategory ID"),
  body("brand")
    .optional()
    .notEmpty()
    .isMongoId()
    .withMessage("Invalid brand ID"),
];

export const getProduct = [
  param("id").isMongoId().withMessage("Invalid brand ID"),
];

export const getProducts = [
  param("categoryId").optional().isMongoId().withMessage("Invalid category ID"),
  param("subcategoryId")
    .optional()
    .isMongoId()
    .withMessage("Invalid subcategory ID"),
  param("brandId").optional().isMongoId().withMessage("Invalid brand ID"),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Limit must be a positive integer"),
];

export const updateProduct = [
  param("id").isMongoId().withMessage("Invalid product ID"),
  body("name")
    .optional()
    .notEmpty()
    .isString()
    .withMessage("Name must be a string")
    .isLength({ min: 3, max: 256 })
    .withMessage("Name must be between 3 and 32 characters long"),
  body("title")
    .optional()
    .notEmpty()
    .isString()
    .withMessage("Title must be a string")
    .isLength({ min: 8, max: 256 })
    .withMessage("Title must be between 8 and 256 characters long"),
  body("description")
    .optional()
    .notEmpty()
    .isString()
    .withMessage("Product description must be a string")
    .isLength({ min: 24, max: 700 })
    .withMessage("Product description must be between 24 and 500 characters"),
  body("quantity")
    .optional()
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage("Quantity must be a positive integer"),
  body("price")
    .optional()
    .notEmpty()
    .toFloat()
    .isFloat({ min: 1.0 })
    .withMessage("Price must be a positive number"),
  body("category")
    .optional()
    .notEmpty()
    .isMongoId()
    .withMessage("Invalid category ID"),
  body("subcategory")
    .optional()
    .notEmpty()
    .isMongoId()
    .withMessage("Invalid subcategory ID"),
  body("brand")
    .optional()
    .notEmpty()
    .isMongoId()
    .withMessage("Invalid brand ID"),
];

export const deleteProduct = [
  param("id").isMongoId().withMessage("Invalid product ID"),
];
