const Category = require("../models/category");
const Item = require("../models/item");
const Account = require("../models/account");
const async = require("async");
const { body, validationResult } = require("express-validator");

// The account thing still have to think of something good to make it work. it can be done how it is setted up
// rn but i dont know if it is the best way.

exports.account = (req, res, next) => {
  /* Account.find().exec((err, account) => {
    if (err) return next(err);

    res.render("account_details", {
      title: "Account details",
      balance: account.balance,
    });
  }); */
  res.render("account_details", {
    title: "Account details",
    balance: 0,
  });
};
