import { Router } from "express";
import * as authService from "./auth.service.js";
import { authorizationMiddleware } from "../../middlewares/authorization.middleware.js";
import { authenticationMiddleware } from "../../middlewares/authentication.middleware.js";
import { UserRoles } from "../../models/user.model.js";

const router = Router();

router.post("/sign-up", authService.signup);
router.post("/sign-in", authService.signin);
router.post("/forgot-password", authService.forgotPassword);
router.post("/verify-reset-code", authService.verifyPasswordResetCode);
router.patch(
  "/reset-password",
  authenticationMiddleware,
  authorizationMiddleware(UserRoles.ADMIN, UserRoles.USER),
  authService.resetPassword
);

export default router;
