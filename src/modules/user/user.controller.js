import { Router } from "express";
import * as userService from "./user.service.js";
import { authenticationMiddleware } from "../../middlewares/authentication.middleware.js";
import { authorizationMiddleware } from "../../middlewares/authorization.middleware.js";
import { UserRoles } from "../../models/user.model.js";

const router = Router();

router.use(authenticationMiddleware);
router.route("/me").get(userService.getLoggedUserData, userService.getUser);
router.route("/me/change-password").patch(userService.updateLoggedUserPassword);
router
  .route("/me/addresses")
  .get(userService.getLoggedUserAddresses)
  .patch(userService.addAddress);
router.route("/me/addresses/:id").delete(userService.removeAddress);
router.route("/me/update-account").patch(userService.updateLoggedUserData);
router.route("/me/deactivate-account").patch(userService.deactivateLoggedUser);

router.use(authorizationMiddleware(UserRoles.ADMIN));

router.route("/").get(userService.getUsers).post(userService.createUser);

router
  .route("/:id")
  .get(userService.getUser)
  .patch(userService.updateUser)
  .delete(userService.deleteUser);

router.patch("/:id/activation", userService.toggleUserActivation);
router.patch("/:id/change-password", userService.changePassword);

export default router;
