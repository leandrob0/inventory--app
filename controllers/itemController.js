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

exports.item_detail = (req, res, next) => {
  Item.findById(req.params.id)
    .exec((err, item) => {
      if(err) return next(err);
      res.render("item_detail", {title: "Item detail", item: item})
    })
}

exports.item_create_get = (req, res, next) => {
  Category.find({})
    .exec((err, categories) => {
      if(err) return next(err);
      res.render("item_form", {title: "Create item", categories: categories, item: undefined})
    })
}
