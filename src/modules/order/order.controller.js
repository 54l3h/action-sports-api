import { Router } from "express";
import * as orderService from "./order.service.js";
import { authenticationMiddleware } from "../../middlewares/authentication.middleware.js";
import { authorizationMiddleware } from "../../middlewares/authorization.middleware.js";
import { UserRoles } from "../../models/user.model.js";

const router = Router();

// Apply authentication to all routes
router.use(authenticationMiddleware);

// ========================================
// SPECIFIC ROUTES FIRST (before dynamic :id routes)
// ========================================

// Get logged user's orders - MUST come before /:id
router.get(
  "/me",
  authorizationMiddleware(UserRoles.USER),
  orderService.getLoggedUserOrders
);

router.post(
  "/pay-with-paytabs",
  authorizationMiddleware(UserRoles.USER),
  orderService.payWithPayTabs
);

// Create checkout session
router.post(
  "/checkout-session/:cartId",
  authorizationMiddleware(UserRoles.USER),
  orderService.getCheckoutSession
);

// Get all orders (admin only)
router.get(
  "/",
  authorizationMiddleware(UserRoles.ADMIN),
  orderService.getAllOrders
);

// Create cash order
router.post(
  "/:cartId",
  authorizationMiddleware(UserRoles.USER),
  orderService.createCashOrder
);

// ========================================
// DYNAMIC ROUTES LAST (after specific routes)
// ========================================

// Get specific order
router.get(
  "/:id",
  authorizationMiddleware(UserRoles.ADMIN, UserRoles.USER),
  orderService.getSpecificOrder
);

// Update payment status
router.patch(
  "/:id/pay",
  authorizationMiddleware(UserRoles.ADMIN),
  orderService.updateOrderPaymentStatus
);

// Update delivery status
router.patch(
  "/:id/status/:status",
  authorizationMiddleware(UserRoles.ADMIN),
  orderService.updateOrderDeliveryStatus
);

// Cancel order
router.patch(
  "/:id/cancel",
  authorizationMiddleware(UserRoles.USER),
  orderService.cancelOrderByUser
);

export default router;

// Destination name
// action-api-webhook

// Endpoint URL
// https://action-sports-api.vercel.app/api/webhook-checkout

// fix(payment): update order service and controller for payment flow
