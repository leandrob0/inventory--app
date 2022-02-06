const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CategorySchema = new Schema({
  name: { type: String, minlength: 3, maxlength: 50 },
  description: { type: String, minlength: 3, maxlength: 100 },
  image: { type: String },
});

CategorySchema.virtual("url").get(function () {
  return "inventory/category/" + this._id;
});

module.exports = mongoose.model("Categorie", CategorySchema);
