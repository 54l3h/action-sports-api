import { Router } from "express";
import validationMiddleware from "../../middlewares/validation.middleware.js";
import * as brandValidationSchema from "./brand.validation.schema.js";
import * as brandService from "./services/index.js";

const router = Router();

router
  .route("/")
  .post(
    brandValidationSchema.createBrand,
    validationMiddleware,
    brandService.createBrand
  )
  .get(
    brandValidationSchema.getBrands,
    validationMiddleware,
    brandService.getBrands
  );

router
  .route("/:id")
  .get(
    brandValidationSchema.getBrand,
    validationMiddleware,
    brandService.getBrand
  )
  .patch(
    brandValidationSchema.updateBrand,
    validationMiddleware,
    brandService.updateBrand
  )
  .delete(
    brandValidationSchema.deleteBrand,
    validationMiddleware,
    brandService.deleteBrand
  );

export default router;
