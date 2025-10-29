import { Router } from "express";
import * as authService from "./auth.service.js";
import { authorizationMiddleware } from "../../middlewares/authorization.middleware.js";
import { UserRoles } from "../../models/user.model.js";

const router = Router();

// router.route('/')

router.post("/sign-up", authService.signup);
router.post("/sign-in", authService.signin);

export default router;
