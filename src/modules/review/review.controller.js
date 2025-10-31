import { Router } from "express";
import * as reviewService from "./review.service.js";
import { authenticationMiddleware } from "../../middlewares/authentication.middleware.js";
import { authorizationMiddleware } from "../../middlewares/authorization.middleware.js";
import { UserRoles } from "../../models/user.model.js";

const router = Router();

router
  .route("/")
  .get(reviewService.getReviews)
  .post(
    authenticationMiddleware,
    authorizationMiddleware(UserRoles.USER),
    reviewService.createReview
  );

router
  .route("/:id")
  .get(reviewService.getReview)
  .patch(
    authenticationMiddleware,
    authorizationMiddleware(UserRoles.USER),
    reviewService.updateReview
  )
  .delete(
    authenticationMiddleware,
    authorizationMiddleware(UserRoles.ADMIN, UserRoles.USER),
    reviewService.deleteReview
  );

export default router;
