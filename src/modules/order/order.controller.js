import { Router } from "express";
import * as orderService from "./order.service.js";
import { authenticationMiddleware } from "../../middlewares/authentication.middleware.js";
import { authorizationMiddleware } from "../../middlewares/authorization.middleware.js";
import { UserRoles } from "../../models/user.model.js";

const router = Router();

router.use(authenticationMiddleware);

router.post(
  "/:cartId",
  authorizationMiddleware(UserRoles.USER),
  orderService.createCashOrder
);

router.get(
  "/",
  authorizationMiddleware(UserRoles.ADMIN),
  orderService.getAllOrders
);

router.get(
  "/me",
  authorizationMiddleware(UserRoles.USER),
  orderService.getLoggedUserOrders
);

router.get(
  "/:id",
  authorizationMiddleware(UserRoles.ADMIN, UserRoles.USER),
  orderService.getSpecificOrder
);

router.patch(
  "/:id/pay",
  authorizationMiddleware(UserRoles.ADMIN),
  orderService.updateOrderPaymentStatus
);

router.patch(
  "/:id/deliver",
  authorizationMiddleware(UserRoles.ADMIN),
  orderService.updateOrderDeliveryStatus
);

router.patch(
  "/:id/cancel",
  // authorizationMiddleware(UserRoles.USER),
  orderService.cancelOrderByUser
);

export default router;
