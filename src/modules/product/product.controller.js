import { Router } from "express";
import * as productService from "./services/index.js";
import * as productValidationSchema from "./product.validation.schema.js";
import validationMiddleware from "../../middlewares/validation.middleware.js";

const router = Router();

router
  .route("/")
  .get(
    productValidationSchema.getProducts,
    validationMiddleware,
    productService.getProducts
  )
  .post(
    productValidationSchema.createProduct,
    validationMiddleware,
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
    productValidationSchema.updateProduct,
    validationMiddleware,
    productService.updateProduct
  )
  .delete(
    productValidationSchema.deleteProduct,
    validationMiddleware,
    productService.deleteProduct
  );
export default router;
