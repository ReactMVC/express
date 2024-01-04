const mongoose = require("mongoose");

const userData = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A user must have a name"],
    },
    email: {
      type: String,
      required: [true, "A user must have a email"],
    },
    password: {
      type: String,
      required: [true, "A user must have a password"],
    },
    token: {
      type: String,
      required: [true, "A user must have a token"],
    },
    role: {
      type: String,
      required: [true, "A user must have a role"],
    },
    active: {
      type: String,
      required: [true, "A user must have a active"],
    }
  },
  { collection: "users" }
);

const User = mongoose.model("User", userData);

module.exports = User;