import CatgeoryModel from "../../../models/category.model.js";

export const getCategories = async (req, res, next) => {
  const categories = await CatgeoryModel.find({});
  res.json(categories);
};
