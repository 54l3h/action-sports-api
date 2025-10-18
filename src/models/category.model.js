import { model, Schema } from "mongoose";

const categorySchama = new Schema({
  name: String,
});

const CatgeoryModel = model("Category", categorySchama);

export default CatgeoryModel;
