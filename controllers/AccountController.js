const User = require("../modules/database/User");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const verifyJwt = promisify(jwt.verify);

/**
 * Get User API with auth (for users)
 * @param {Authorization} req
 * @param {status, data} res
 * @returns
 */
exports.getAccount = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(403).json({ status: false, message: "Invalid token" });
    }

    const userToken = authHeader && authHeader.split(" ")[1];
    if (!userToken) {
      return res.status(403).json({ status: false, message: "Invalid token" });
    }

    // Using promisified jwt.verify
    await verifyJwt(userToken, process.env.APP_KEY);

    const user = await User.findOne({
      token: userToken,
    });

    if (!user) {
      return res.status(400).json({
        status: false,
        error: "User not found",
      });
    }

    const sanitizedUser = user.toObject();

    delete sanitizedUser.password;

    return res.status(200).json({
      status: true,
      data: sanitizedUser,
    });
  } catch (error) {
    return res.status(400).json({
      status: false,
      error: "User not found",
    });
  }
};
