import { Router } from "express";
import * as productService from "./services/index.js";
import * as productValidationSchema from "./product.validation.schema.js";
import validationMiddleware from "../../middlewares/validation.middleware.js";
import {
  uploadMultipleImages,
  uploadSingleImage,
} from "../../middlewares/upload.middleware.js";
import { UserRoles } from "../../models/user.model.js";
import { authenticationMiddleware } from "../../middlewares/authentication.middleware.js";
import { authorizationMiddleware } from "../../middlewares/authorization.middleware.js";

const router = Router();

router
  .route("/")
  .get(
    productValidationSchema.getProducts,
    validationMiddleware,
    productService.getProducts
  )
  .post(
    authenticationMiddleware,
    authorizationMiddleware(UserRoles.ADMIN),
    uploadMultipleImages("images"),
    // productValidationSchema.createProduct,
    // validationMiddleware,
    productService.createProduct
  );

router
  .route("/:id")
  .get(
    productValidationSchema.getProduct,
    validationMiddleware,
    productService.getProduct
  )
  .patch(
    authenticationMiddleware,
    authorizationMiddleware(UserRoles.ADMIN),
    uploadMultipleImages("images"),
    productValidationSchema.updateProduct,
    validationMiddleware,
    productService.updateProduct
  )
  .delete(
    authenticationMiddleware,
    (req, res, next) => {
      console.log("done");
      next();
    },
    authorizationMiddleware(UserRoles.ADMIN),
    productValidationSchema.deleteProduct,
    validationMiddleware,
    productService.deleteProduct
  );
export default router;
