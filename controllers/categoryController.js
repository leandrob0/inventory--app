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
