#! /usr/bin/env node

console.log(
  "This script populates some test values to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true"
);

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require("async");
//var Account = require("./models/account");
var Category = require("./models/category");
var Item = require("./models/item");

var mongoose = require("mongoose");
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

//var accounts = [];
var categories = [];
var items = [];

function categoryCreate(name, description, image, cb) {
  let categorydetail = { name: name, description: description, image: image };
  let category = new Category(categorydetail);

  category.save(function (err) {
    if (err) {
      console.log("Error creating category: ", err);
      cb(err, null);
      return;
    }
    console.log("New Category: " + category);
    categories.push(category);
    cb(null, category);
  });
}

function itemCreate(
  name,
  image,
  description,
  category,
  price,
  number_in_stock,
  cb
) {
  let itemDetail = {
    name: name,
    image: image,
    description: description,
    category: category,
    price: price,
    number_in_stock: number_in_stock,
  };

  let item = new Item(itemDetail);

  item.save(function (err) {
    if (err) {
      console.log("Error creating item: ", err);
      cb(err, null);
      return;
    }
    console.log("New item: " + item);
    items.push(item);
    cb(null, item);
  });
}

function createCategories(cb) {
  async.series(
    [
      function (callback) {
        categoryCreate(
          "Sweets",
          "Sweet candies",
          "http://localhost:3000/images/sweets.png",
          callback
        );
      },
      function (callback) {
        categoryCreate(
          "Bottled drinks",
          "All types of drinks in a bottle",
          "http://localhost:3000/images/bottles.jpg",
          callback
        );
      },
      function (callback) {
        categoryCreate(
          "Canned drinks",
          "All types of drinks in a can",
          "http://localhost:3000/images/cans.jpg",
          callback
        );
      },
    ],
    // optional callback
    cb
  );
}

function createItems(cb) {
  async.parallel(
    [
      function (callback) {
        itemCreate(
          "Coca cola",
          "http://localhost:3000/images/coca-bottle.png",
          "Bottled Coca Cola",
          [categories[1]],
          6,
          100,
          callback
        );
      },
      function (callback) {
        itemCreate(
          "Flynn paff",
          "http://localhost:3000/images/flyn-paff.png",
          "Small sweet",
          [categories[0]],
          0.5,
          300,
          callback
        );
      },
      function (callback) {
        itemCreate(
          "Coca cola",
          "http://localhost:3000/images/coca-can.png",
          "Canned Coca Cola",
          [categories[2]],
          3,
          50,
          callback
        );
      },
      function (callback) {
        itemCreate(
          "Mountain dew",
          "http://localhost:3000/images/mtdew.png",
          "Sweet beverage in a can",
          [categories[0], categories[2]],
          2.5,
          100,
          callback
        );
      },
    ],
    // optional callback
    cb
  );
}

async.series(
  [createCategories, createItems],
  // Optional callback
  function (err, results) {
    if (err) {
      console.log("FINAL ERR: " + err);
    } else {
      console.log("Results: " + results);
    }
    // All done, disconnect from database
    mongoose.connection.close();
  }
);
