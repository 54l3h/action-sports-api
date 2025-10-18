import slugify from "slugify";
import CatgeoryModel from "../../../models/category.model.js";

export const createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) {
      throw new Error("Category name is required");
    }

    const slug = slugify(name, "-");
    const category = await CatgeoryModel.create({ name, slug });
    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
