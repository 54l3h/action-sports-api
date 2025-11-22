import { Router } from "express";
import { authenticationMiddleware } from "../../middlewares/authentication.middleware.js";
import { authorizationMiddleware } from "../../middlewares/authorization.middleware.js";
import * as shippingZoneService from "./shippingZone.service.js";
import { UserRoles } from "../../models/user.model.js";

const router = Router();

// =============================
// Public for authenticated users
// =============================
router.use(authenticationMiddleware);
router.get("/", shippingZoneService.getAllShippingZones);

router.get("/:id", shippingZoneService.getShippingZoneById);

// =============================
// Admin-only routes
// =============================
router.use(authorizationMiddleware(UserRoles.ADMIN));
router.post("/", shippingZoneService.addShippingZone);

router.patch("/:id", shippingZoneService.updateShippingZone);

router.delete("/:id", shippingZoneService.deleteShippingZone);

export default router;
