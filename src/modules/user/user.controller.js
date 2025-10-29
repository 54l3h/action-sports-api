import { Router } from "express";
import * as userService from "./user.service.js";

const router = Router();

router.route("/").get(userService.getUsers).post(userService.createUser);

router
  .route("/:id")
  .get(userService.getUser)
  .patch(userService.updateUser)
  .delete(userService.deleteUser);

router.patch("/:id/activation", userService.toggleUserActivation);
router.patch("/:id/change-password", userService.changePassword);

export default router;
