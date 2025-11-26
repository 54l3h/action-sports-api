import { Router } from "express";
import * as cartService from "./cart.service.js";
import { authenticationMiddleware } from "../../middlewares/authentication.middleware.js";
import { authorizationMiddleware } from "../../middlewares/authorization.middleware.js";
import { UserRoles } from "../../models/user.model.js";

const router = Router();

router.use(authenticationMiddleware);
router
  .route("/")
  .post(cartService.addProductToCart)
  .get(cartService.getLoggedUserCart);

router.route("/clear").patch(cartService.clearLoggedUserCart);

router
  .route("/:itemId")
  .delete(cartService.removeSpecificCartItem)
  .patch(cartService.updateSpecificItemQuantity);

export default router;
