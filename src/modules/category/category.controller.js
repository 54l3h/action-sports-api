import { Router } from "express";
import { getCategories } from "./services/getCategories.service.js";

const router = new Router();

router.get("/get-categories", getCategories);

export default router;
