import { Router } from "express";
import { getCategories } from "./services/getCategories.service.js";
import { createCategory } from "./services/createCategory.service.js";
import { getCategoryById } from "./services/getCategoryById.service.js";

const router = new Router();

router.get("/list", getCategories);
router.get("/:id", getCategoryById);
router.post("/create-category", createCategory);

export default router;
