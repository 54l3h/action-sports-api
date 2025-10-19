import { Router } from "express";
import { getCategories } from "./services/getCategories.service.js";
import { createCategory } from "./services/createCategory.service.js";
import { getCategoryById } from "./services/getCategoryById.service.js";
import { updateCategory } from "./services/updateCategory.service.js";
import { deleteCategory } from "./services/deleteCategory.service.js";

const router = new Router();

router.get("", getCategories);
router.get("/:id", getCategoryById);
router.post("", createCategory);
router.patch("/:id", updateCategory);
router.delete("/:id", deleteCategory);

export default router;
