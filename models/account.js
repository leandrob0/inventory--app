const mongoose = require("mongoose");

const Schema = mongoose.Schema;

/*
    This model is mainly to keep track of your account losses and gains of money.
    Also to keep track of which items and categories are the most sold / most money generated
    If an item/category is deleted. It will also be deleted from here, untracking them.
    The balance total will not change if the item or category is deleted.
*/

const AccountSchema = new Schema({
  items: [
    {
      item: { type: Schema.Types.ObjectId, ref: "Item", required: true },
      quantitySold: { type: Number, required: true },
      balance: { type: Number },
    },
  ],
  categories: [
    {
      category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
      quantitySold: { type: Number, required: true },
      balance: { type: Number },
    },
  ],
  balanceTotal: { type: Number },
});

module.exports = mongoose.model("Account", AccountSchema);
