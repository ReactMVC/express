const express = require("express");
const AccountController = require("../controllers/AccountController");

const AccountRouter = express.Router();

// Account Routes
AccountRouter.route("/").get(AccountController.getAccount);

module.exports = AccountRouter;