import { Router } from "express";
import * as userService from "./user.service.js";
import { authenticationMiddleware } from "../../middlewares/authentication.middleware.js";
import { authorizationMiddleware } from "../../middlewares/authorization.middleware.js";
import { UserRoles } from "../../models/user.model.js";

const router = Router();

router
  .route("/")
  .get(
    authenticationMiddleware,
    authorizationMiddleware(UserRoles.ADMIN),
    userService.getUsers
  )
  .post(
    authenticationMiddleware,
    authorizationMiddleware(UserRoles.ADMIN),
    userService.createUser
  );

router
  .route("/:id")
  .get(userService.getUser)
  .patch(
    authenticationMiddleware,
    authorizationMiddleware(UserRoles.ADMIN),
    userService.updateUser
  )
  .delete(
    authenticationMiddleware,
    authorizationMiddleware(UserRoles.ADMIN),
    userService.deleteUser
  );

router.patch(
  "/:id/activation",
  authenticationMiddleware,
  authorizationMiddleware(UserRoles.ADMIN),
  userService.toggleUserActivation
);
router.patch(
  "/:id/change-password",
  authenticationMiddleware,
  authorizationMiddleware(UserRoles.USER),
  userService.changePassword
);

export default router;
