const express = require("express");
const DemoController = require("../controllers/DemoController");

const DemoRouter = express.Router();

// Demo Routes
DemoRouter.route("/")
    .get(DemoController.demoAPI);

module.exports = DemoRouter;