import { body, param, query } from "express-validator";

export const createUser = [
  body("name")
    .exists({ checkFalsy: true })
    .withMessage("Name is required")
    .isString()
    .withMessage("Name must be a string"),
  body("email")
    .exists({ checkFalsy: true })
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address"),
  body("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("Invalid mobile phone")
    .isLength({ min: 2, max: 32 })
    .withMessage("Name must be between 2 and 32 characters long"),
  body("password")
    .exists({ checkFalsy: true })
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

export const getUser = [param("id").isMongoId().withMessage("Invalid User ID")];

export const getUsers = [
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

export const updateUser = [
  param("id").isMongoId().withMessage("Invalid User ID"),
  body("name")
    .optional()
    .isString()
    .withMessage("Name must be a string")
    .isLength({ min: 2, max: 32 })
    .withMessage("Name must be between 2 and 32 characters long"),
];

export const deleteUser = [
  param("id").isMongoId().withMessage("Invalid User ID"),
];
