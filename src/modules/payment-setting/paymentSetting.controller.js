import { Router } from "express";
import * as paymentSettingService from "./paymentSetting.service.js";
import { authenticationMiddleware } from "../../middlewares/authentication.middleware.js";
import { authorizationMiddleware } from "../../middlewares/authorization.middleware.js";
import { UserRoles } from "../../models/user.model.js";

const router = Router();

router.get(
  "/",
  authenticationMiddleware,
  authorizationMiddleware(UserRoles.USER, UserRoles.ADMIN),
  paymentSettingService.getStatus
);
router.patch(
  "/toggle/:key",
  authenticationMiddleware,
  authorizationMiddleware(UserRoles.ADMIN),
  paymentSettingService.toggle
);

export default router;
