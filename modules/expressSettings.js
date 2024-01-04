const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("./envConfig");

const app = express();

// Parse JSON
app.use(express.json());

// Dev
const mode = process.env.NODE_ENV || "production";
if (mode === "development") {
  app.use(morgan("dev"));
}

// CORS Access
app.use(cors());

// Load static files
app.use(express.static(`${__dirname}/../public`));


// Fix JSON payload
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res
      .status(400)
      .send({ status: false, message: "Invalid JSON payload" });
  }
  next();
});

module.exports = app;
