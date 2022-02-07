var express = require("express");
var router = express.Router();

const item_controller = require("../controllers/itemController");
const category_controller = require("../controllers/categoryController");
const account_controller = require("../controllers/accountController");

router.get("/", item_controller.index);

//****************************************************
// ITEMS ROUTES

// GET list of items
router.get("/items", item_controller.item_list);

// GET specific item
router.get("/item/:id", item_controller.item_detail);

// GET create new item form
router.get("/item/create");

// POST create new item form
router.post("/item/create");

// GET delete item
router.get("/item/:id/delete");

// POST delete item
router.post("/item/:id/delete");

// GET update item
router.get("/item/:id/update");

// POST update item
router.post("/item/:id/update");

//****************************************************
// CATEGORIES ROUTES

// GET list of categories
router.get("/categories", category_controller.category_list);

// GET specific category
router.get("/category/:id");

// GET create new category form
router.get("/category/create");

// POST create new category form
router.post("/category/create");

// GET delete category
router.get("/category/:id/delete");

// POST create new category form
router.post("/category/create");

// GET update category
router.get("/category/:id/update");

// POST create new category form
router.post("/category/create");

//****************************************************
// ACCOUNT ROUTES

router.get("/account", account_controller.account);

module.exports = router;
