import { Router } from "express";
import * as bannerService from "./banner.service.js";
import { authenticationMiddleware } from "../../middlewares/authentication.middleware.js";
import { authorizationMiddleware } from "../../middlewares/authorization.middleware.js";
import { UserRoles } from "../../models/user.model.js";
import { uploadSingleImage } from "../../middlewares/upload.middleware.js";

const router = Router();

// CRUD endpoints for banners
router.get("/", bannerService.getAllBanners);
router.get("/:id", bannerService.getBannerById);

router.use(authenticationMiddleware);
router.use(authorizationMiddleware(UserRoles.ADMIN));

router.post("/", uploadSingleImage("image"), bannerService.addBanner);
router.patch("/:id", uploadSingleImage("image"), bannerService.updateBanner);
router.delete("/:id", bannerService.deleteBanner);

export default router;

// router
//   .route("/")
//   .get(categoryService.getCategories)
//   .post(
//     authenticationMiddleware,
//     authorizationMiddleware(UserRoles.ADMIN),

//     categoryValidationSchema.createCategory,
//     validationMiddleware,
//     categoryService.createCategory
//   );
