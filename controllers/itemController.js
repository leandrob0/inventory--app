const Category = require("../models/category");
const Item = require("../models/item");
const async = require("async");
const fs = require("fs");
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
      let newPath = req.file.path.split("/");
      newPath.shift();
      item.image = `/${newPath.join("/")}`;

      item.save((err) => {
        if (err) return next(err);
        res.redirect(item.url);
      });
    }
  },
];

exports.item_delete_get = (req, res, next) => {
  // Gets the item to display its values for confirming the delete operation.
  Item.findById(req.params.id).exec((err, item) => {
    if (err) return next(err);
    res.render("item_delete", { title: "Delete item", item: item });
  });
};

exports.item_delete_post = (req, res, next) => {
  Item.findById(req.params.id).exec((err, item) => {
    if (err) return next(err);
    // If the item is not in the db.
    if (item === null) {
      let error = new Error("Item not found");
      error.status = 404;
      return next(error);
    }

    // Path to the item photo
    let completePath = `public${item.image}`;

    // Removes the item photo
    fs.unlink(completePath, function (error) {
      if (error) return next(error);

      // Removes the item and redirects to the items list.
      Item.findByIdAndRemove(req.body.itemid, function deleteItem(err) {
        if (err) return next(err);
        res.redirect("/inventory/items");
      });
    });
  });
};

exports.item_update_get = (req, res, next) => {
  async.parallel(
    {
      item: (callback) => Item.findById(req.params.id).exec(callback),
      categories: (callback) => Category.find({}).exec(callback),
    },
    (err, results) => {
      if (err) return next(err);
      if (results.item == null) {
        let error = new Error("Item not found");
        error.status = 404;
        return next(error);
      }

      res.render("item_form", {
        title: "Update item",
        item: results.item,
        categories: results.categories,
        errors: undefined,
      });
    }
  );
};

exports.item_update_post = [
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
      _id: req.params.id, // The item will remain with the same ID.
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
      // Have to the delete the image that is selected rn, to change it for the new one.

      // Removes the photo
      let completePath;
      Item.findById(req.params.id).exec((err,itemImg) => {
        if(err) return next(err);
        // Path to the item photo
        completePath = `public${itemImg.image}`;

        fs.unlink(completePath, (error) => {
          if(error) return next(error);
        })
      })

      // Adds the new photo url to the item and saves it.
      let newPath = req.file.path.split("/");
      newPath.shift();
      item.image = `/${newPath.join("/")}`;

      // Updates the item.
      Item.findByIdAndUpdate(req.params.id, item, {}, (err, item) => {
        if(err) return next(err);
        res.redirect(item.url);
      })
    }
  },
]