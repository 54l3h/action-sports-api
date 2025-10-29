import { Router } from "express";
import validationMiddleware from "../../middlewares/validation.middleware.js";
import * as brandValidationSchema from "./brand.validation.schema.js";
import * as brandService from "./services/index.js";
import { uploadSingleImage } from "../../middlewares/upload.middleware.js";
import { authenticationMiddleware } from "../../middlewares/authentication.middleware.js";
import { authorizationMiddleware } from "../../middlewares/authorization.middleware.js";
import { UserRoles } from "../../models/user.model.js";

const router = Router();

router
  .route("/")
  .post(
    authenticationMiddleware,
    authorizationMiddleware(UserRoles.ADMIN),
    uploadSingleImage("image"),
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
    authenticationMiddleware,
    authorizationMiddleware(UserRoles.ADMIN),
    uploadSingleImage("image"),
    brandValidationSchema.updateBrand,
    validationMiddleware,
    brandService.updateBrand
  )
  .delete(
    authenticationMiddleware,
    authorizationMiddleware(UserRoles.ADMIN),
    brandValidationSchema.deleteBrand,
    validationMiddleware,
    brandService.deleteBrand
  );

export default router;
