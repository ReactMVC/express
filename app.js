const mongoose = require("mongoose");
const app = require("./routes");
require("./modules/envConfig");

const db = process.env.DATABASE || "";

(async () => {
  try {
    await mongoose.connect(db);
    console.log("Database connected successfully!");
  } catch (error) {
    console.error("Error: " + error.message);
  }
})();

module.exports = app;