const Category = require("../models/category");
const Item = require("../models/item");
const async = require("async");
const { body, validationResult } = require("express-validator");
const { upload } = require("../public/javascripts/helper");

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
  Item.findById(req.params.id).exec((err, item) => {
    if (err) return next(err);
    res.render("item_detail", { title: "Item detail", item: item });
  });
};

exports.item_create_get = (req, res, next) => {
  Category.find({}).exec((err, categories) => {
    if (err) return next(err);

    res.render("item_form", {
      title: "Create item",
      categories: categories,
      item: undefined,
      errors: undefined,
    });
  });
};

exports.item_create_post = [
  // Convert the categories to an array.
  (req, res, next) => {
    if (!(req.body.category instanceof Array)) {
      if (typeof req.body.category === "undefined") req.body.category = [];
      else req.body.category = new Array(req.body.category);
    }
    next();
  },

  // Upload image
  upload.single("image"),

  // Validate and sanitize fields.
  body("item_name", "Name for the item MUST be specified")
    .trim()
    .isLength({ min: 2 })
    .escape(),
  body("description")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 2 })
    .escape(),
  body("category.*").escape(),
  body("price").escape(),
  body("in-stock").escape(),

  // Process the request after sanitization, validation and image upload.
  (req, res, next) => {
    // Extract the validation errors from a request.
    let errors = validationResult(req);

    // Create a Item object with escaped and trimmed data.
    let item = new Item({
      name: req.body.item_name,
      description: req.body.description,
      category: req.body.category,
      price: req.body.price,
      number_in_stock: req.body.in_stock,
    });

    let fileErrors = [];

    if (req.fileValidationError) {
      fileErrors.push({ msg: "File (format) selected is not valid" });
    } else if (!req.file) {
      fileErrors.push({ msg: "Please select an image to upload" });
    }

    if (!errors.isEmpty() || fileErrors.length > 0) {
      // There are errors. Render form again with sanitized values/error messages.
      // This lines puts together all the errors if there are errors.
      errors = errors.array();
      
      Category.find({}).exec((err, categories) => {
        if (err) return next(err);

        res.render("item_form", {
          title: "Create item",
          categories: categories,
          item: item,
          errors: errors.length > 0 ? errors : fileErrors,
        });
      });
    } else {
      // Path formatted to work.
      let newPath = req.file.path.split('/');
      newPath.shift();
      item.image = `/${newPath.join('/')}`;

      item.save((err) => {
        if(err) return next(err);
        res.redirect(item.url);
      })
    }
  },
];
