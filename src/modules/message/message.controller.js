import { Router } from "express";
import * as messageService from "./message.service.js";
import { authenticationMiddleware } from "../../middlewares/authentication.middleware.js";
import { authorizationMiddleware } from "../../middlewares/authorization.middleware.js";
import { UserRoles } from "../../models/user.model.js";

const router = Router();

// Public endpoint for guests to send messages
router.post("/", messageService.createGuestMessage);

// Admin endpoints — require auth + role
router.use(authenticationMiddleware);
router.get(
  "/",
  authorizationMiddleware(UserRoles.ADMIN),
  messageService.getAllMessages
);
router.patch(
  "/:id/watch",
  authorizationMiddleware(UserRoles.ADMIN),
  messageService.markMessageWatched
);

export default router;
