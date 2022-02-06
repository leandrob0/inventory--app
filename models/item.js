const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ItemSchema = new Schema({
  name: { type: String, minlength: 2, maxlength: 50, required: true },
  image: { type: String },
  description: { type: String, minlength: 2, maxlength: 100 },
  category: [{ type: Schema.Types.ObjectId, ref: "Category" }],
  price: { type: Number, max: 100000, min: 0, required: true },
  number_in_stock: { type: Number, max: 100000, min: 0, required: true },
});

ItemSchema.virtual("url").get(function () {
  return "inventory/item/" + this._id;
});

module.exports = mongoose.model("Item", ItemSchema);
