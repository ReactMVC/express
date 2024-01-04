const express = require("express");
const UserController = require("../controllers/UserController");

const UserRouter = express.Router();

// User Routes
UserRouter.route("/")
  .post(UserController.createUser)
  .get(UserController.getAllUser);

UserRouter.route("/:id")
  .get(UserController.getUser)
  .patch(UserController.updateUser)
  .delete(UserController.deleteUser);

UserRouter.route("/login").post(UserController.Login);

module.exports = UserRouter;