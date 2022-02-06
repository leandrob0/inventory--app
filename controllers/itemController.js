const Category = require("../models/category");
const Item = require("../models/item");
const async = require("async");
const { body, validationResult } = require("express-validator");

exports.index = (req, res, next) => {
  res.render("index", { title: "Inventory manager" });
};

exports.item_list = (req, res, next) => {
  Item.find()
    .sort([["name", "ascending"]])
    .exec((err, items) => {
      if (err) return next(err);
      res.render("item_list", { title: "Items", items: items });
    });
};
