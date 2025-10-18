import { Router } from "express";
import { getCategories } from "./services/getCategories.service.js";
import { createCategory } from "./services/createCategory.service.js";

const router = new Router();

router.get("/get-categories", getCategories);
router.post("/create-category", createCategory);

export default router;
