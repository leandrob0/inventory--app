const Category = require("../models/category");
const { body, validationResult } = require("express-validator");

exports.category_list = (req, res, next) => {
  Category.find()
    .sort([["name", "ascending"]])
    .exec((err, categories) => {
      if (err) return next(err);
      res.render("category_list", { title: "Categories", categories: categories });
    });
};

exports.category_detail = (req, res, next) => {
  Category.findById(req.params.id)
    .exec((err, category) => {
      if(err) return next(err);
      res.render("category_detail", {title: "Category detail", category: category})
    })
}
