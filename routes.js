const app = require("./modules/expressSettings");
const UserRouter = require("./routes/userRouter");
const AccountRouter = require("./routes/accountRouter");
const DemoRouter = require("./routes/demoRouter");

// Users Router
app.use("/api/v1/users", UserRouter);

// Account Router
app.use("/api/v1/account", AccountRouter);

// Account Router
app.use("/api/v1", DemoRouter);

module.exports = app;