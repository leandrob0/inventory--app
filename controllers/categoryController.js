const Category = require("../models/category");
const { upload } = require("../public/javascripts/helper");
const { body, validationResult } = require("express-validator");

exports.category_list = (req, res, next) => {
  Category.find()
    .sort([["name", "ascending"]])
    .exec((err, categories) => {
      if (err) return next(err);
      res.render("category_list", {
        title: "Categories",
        categories: categories,
      });
    });
};

exports.category_detail = (req, res, next) => {
  Category.findById(req.params.id).exec((err, category) => {
    if (err) return next(err);
    res.render("category_detail", {
      title: "Category detail",
      category: category,
    });
  });
};

exports.category_create_get = (req, res, next) => {
  res.render("category_form", {
    title: "Create category",
    category: undefined,
    errors: undefined,
  });
};

exports.category_create_post = [
  // Upload image
  upload.single("category_image"),

  // Validate and sanitize inputs.
  body("category_name").trim().isLength({ min: 3, max: 50 }).escape(),
  body("category_description").trim().isLength({ min: 3, max: 100 }).escape(),

  // Process request
  (req, res, next) => {
    // Checks for errors in the express-validator module.
    const errors = validationResult(req);
    let fileErrors = [];

    // Creates the category object.
    let category = new Category({
      name: req.body.category_name,
      description: req.body.category_description,
    });

    // Checks for errors in the file uploaded.
    if (req.fileValidationError) {
      fileErrors.push({ msg: "File (format) selected is not valid" });
    } else if (!req.file) {
      fileErrors.push({ msg: "Please select an image to upload" });
    }

    if (!errors.isEmpty() || fileErrors.length > 0) {
      res.render("category_form", {
        title: "Create item",
        category: category,
        errors: errors.isEmpty() ? fileErrors : errors.array(),
      });
    } else {
      // Inserts the image path.
      // Path formatted to work.
      let newPath = req.file.path.split("/");
      newPath.shift();
      category.image = `/${newPath.join("/")}`;

      // Saves the category to the database.
      category.save((err) => {
        if (err) return next(err);
        res.redirect(category.url);
      });
    }
  },
];
