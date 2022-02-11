const Category = require("../models/category");
const Item = require("../models/item");
const async = require("async");
const fs = require("fs");
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
  async.parallel(
    {
      category: (callback) => Category.findById(req.params.id).exec(callback),
      items: (callback) =>
        Item.find({ category: req.params.id }, "name image").exec(callback),
    },
    (err, results) => {
      if (err) return next(err);
      if (results.category == null) res.redirect("/inventory/categories");

      res.render("category_detail", {
        title: "Category details",
        category: results.category,
        items: results.items,
      });
    }
  );
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

exports.category_delete_get = (req, res, next) => {
  async.parallel(
    {
      category: (callback) => Category.findById(req.params.id).exec(callback),
      items: (callback) =>
        Item.find({ category: req.params.id }, "name image").exec(callback),
    },
    (err, results) => {
      if (err) return next(err);
      if (results.category == null) res.redirect("/inventory/categories");

      res.render("category_delete", {
        title: "Delete category",
        category: results.category,
        items: results.items,
      });
    }
  );
};

exports.category_delete_post = (req, res, next) => {
  async.parallel(
    {
      category: (callback) => Category.findById(req.params.id).exec(callback),
      items: (callback) =>
        Item.find({ category: req.params.id }, "name image").exec(callback),
    },
    (err, results) => {
      if (err) return next(err);
      if (results.items.length > 0) {
        // Category still has books, so render as a get request.
        res.render("category_delete", {
          title: "Delete category",
          category: results.category,
          items: results.items,
        });
        return;
      } else {
        // Path to the category photo
        let completePath = `public${results.category.image}`;

        // Removes the category photo
        fs.unlink(completePath, function (err) {
          if (err) return next(err);

          // Removes the category and redirects to the categories list.
          Category.findByIdAndRemove(
            req.body.categoryid,
            function deleteCategory(err) {
              if (err) return next(err);
              res.redirect("/inventory/categories");
            }
          );
        });
      }
    }
  );
};

exports.category_update_get = (req, res, next) => {
  Category.findById(req.params.id).exec((err, category) => {
    if (err) return next(err);
    if (category == null) {
      let error = new Error("Category not found");
      error.status = 404;
      return next(error);
    }

    res.render("category_form", {
      title: "Update category",
      category: category,
      errors: undefined,
    });
  });
};

exports.category_update_post = [
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

    // Creates the updated category object.
    let category = new Category({
      name: req.body.category_name,
      description: req.body.category_description,
      _id: req.params.id,
    });

    // Checks for errors in the file uploaded.
    if (req.fileValidationError) {
      fileErrors.push({ msg: "File (format) selected is not valid" });
    } else if (!req.file) {
      fileErrors.push({ msg: "Please select an image to upload" });
    }

    if (!errors.isEmpty() || fileErrors.length > 0) {
      res.render("category_form", {
        title: "Update item",
        category: category,
        errors: errors.isEmpty() ? fileErrors : errors.array(),
      });
    } else {
      // Have to delete the image that is selected rn, to change it for the new one.

      // Removes the photo
      let completePath;
      Category.findById(req.params.id).exec((err, categoryImg) => {
        if (err) return next(err);

        completePath = `public${categoryImg.image}`;

        fs.unlink(completePath, (err) => {
          if (err) return next(err);
        });
      });

      let newPath = req.file.path.split("/");
      newPath.shift();
      category.image = `/${newPath.join("/")}`;

      // Updates the item
      Category.findByIdAndUpdate(
        req.params.id,
        category,
        {},
        (err, category) => {
          if (err) return next(err);
          res.redirect(category.url);
        }
      );
    }
  },
];
