const User = require("../modules/database/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { promisify } = require("util");

const verifyJwt = promisify(jwt.verify);

/**
 * Register API (for users)
 * @param {name, email, password} req
 * @param {status, message, token} res
 * @returns
 */
exports.createUser = async (req, res) => {
  try {
    if (
      !req.body ||
      !req.body.name ||
      !req.body.email ||
      !req.body.password
    ) {
      res.status(400).json({
        status: false,
        message: "please enter all data",
      });
      return;
    }

    if (typeof req.body.password !== "string") {
      return res
        .status(400)
        .json({ status: false, message: "Password must be a string" });
    }

    if (typeof req.body.email !== "string") {
      return res
        .status(400)
        .json({ status: false, message: "Email must be a string" });
    }

    if (typeof req.body.name !== "string") {
      return res
        .status(400)
        .json({ status: false, message: "Name must be a string" });
    }

    if (!/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(req.body.email)) {
      return res.status(400).json({ status: false, message: "Invalid email" });
    }

    const existingUser = await User.findOne({
      email: req.body.email
    });

    if (existingUser) {
      res.status(400).json({
        status: false,
        message: "User already exists with the given email",
      });
      return;
    }

    const password = await bcrypt.hash(req.body.password, 10);

    const token = jwt.sign({ email: req.body.email }, process.env.APP_KEY, {
      expiresIn: "100y",
      algorithm: "HS256",
    });

    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: password,
      token: token,
      role: 0,
      active: 1,
    });

    res.status(200).json({
      status: true,
      message: "user created successfully",
      token: token,
      id: user._id,
      active: 1,
      role: user.role,
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      error: error.message,
    });
    return;
  }
};

/**
 * Login API (for users)
 * @param {email, password} req
 * @param {status, message, token} res
 * @returns
 */
exports.Login = async (req, res) => {
  try {
    if (!req.body || !req.body.email || !req.body.password) {
      res.status(400).json({
        status: false,
        message: "please enter all data",
      });
      return;
    }

    if (typeof req.body.password !== "string") {
      return res
        .status(400)
        .json({ status: false, message: "Password must be a string" });
    }

    if (typeof req.body.email !== "string") {
      return res
        .status(400)
        .json({ status: false, message: "Email must be a string" });
    }

    const user = await User.findOne({
      email: req.body.email,
    });

    if (!user) {
      return res
        .status(404)
        .json({ status: false, message: "Incorrect email or password" });
    }

    const match = await bcrypt.compare(req.body.password, user.password);

    if (!match) {
      res.status(400).json({
        status: false,
        message: "Incorrect email or password",
      });
      return;
    }

    const token = jwt.sign({ email: req.body.email }, process.env.APP_KEY, {
      expiresIn: "100y",
      algorithm: "HS256",
    });

    await User.updateOne({ email: req.body.email }, { token: token });

    res.status(200).json({
      status: true,
      message: "user logged in successfully",
      token: token,
      id: user._id,
      active: user.active,
      role: user.role,
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      error: error.message,
    });
    return;
  }
};

/**
 * Get All Users API (for users)
 * @param {} req
 * @param {status, result} res
 * @returns
 */
exports.getAllUser = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;

    const totalCount = await User.countDocuments();
    if (!totalCount) {
      return res.status(400).json({
        status: false,
        error: "Error in getting data",
      });
    }

    const pagesCount = Math.ceil(totalCount / limit);

    const data = await User.find()
      .sort({ _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    if (!data) {
      return res.status(400).json({
        status: false,
        error: "Error in getting data",
      });
    }

    if (data.length === 0) {
      return res.status(200).json({
        status: false,
        page: page,
        pagesCount,
        result: [],
      });
    }

    const result = data.map((user) => {
      const { password, email, token, ...result } = user.toObject();
      return result;
    });

    res.status(200).json({
      status: true,
      page: page,
      pagesCount,
      result,
    });
  } catch (error) {
    return res.status(400).json({
      status: false,
      error: "Error in getting data",
    });
  }
};

/**
 * Get User API (for users)
 * @param {/id} req
 * @param {status, data} res
 * @returns
 */
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(400).json({
        status: false,
        error: "User not found",
      });
    }

    if (user.role === "1" || user.role === 1) {
      const {
        password,
        token,
        ...data
      } = user.toObject();
      return res.status(200).json({
        status: true,
        data,
      });
    } else {
      const { password, email, token, ...data } = user.toObject();
      return res.status(200).json({
        status: true,
        data,
      });
    }
  } catch (error) {
    return res.status(400).json({
      status: false,
      error: "User not found",
    });
  }
};

/**
 * Update User API (for users)
 * @param {/id, Authorization, data} req
 * @param {status, data} res
 * @returns
 */
exports.updateUser = async (req, res) => {
  try {
    // Check if request body is provided
    if (!req.body) {
      return res.status(400).json({
        status: false,
        message: "Please enter all data",
      });
    }

    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res
        .status(403)
        .json({ status: false, message: "Invalid token or id" });
    }

    const userToken = authHeader && authHeader.split(" ")[1];
    if (!userToken) {
      return res
        .status(403)
        .json({ status: false, message: "Invalid token or id" });
    }

    // Find user by ID
    const id = await User.findById(req.params.id);
    if (!id) {
      return res.status(400).json({
        status: false,
        error: "User not found",
      });
    }

    const userID = id._id;

    // Validate email format and check for duplicates
    if (req.body.email) {
      if (
        !/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(req.body.email)
      ) {
        return res
          .status(400)
          .json({ status: false, message: "Invalid email format" });
      }

      const findUser = await User.findOne({ email: req.body.email });

      if (
        findUser &&
        findUser._id &&
        findUser._id.toString() !== userID.toString()
      ) {
        return res.status(403).json({
          status: false,
          message: "Cannot update with a different email",
        });
      }
    }

    // Prevent updating certain fields by the user
    const disallowedFields = ["role", "active"];
    for (const field of disallowedFields) {
      if (req.body[field] !== undefined) {
        return res.status(403).json({
          status: false,
          message: `Cannot update ${field} by user`,
        });
      }
    }

    // Hash the password if provided
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }

    // Verify the JWT token
    await verifyJwt(userToken, process.env.APP_KEY);

    // Update user
    const user = await User.findOneAndUpdate(
      { token: userToken, _id: userID },
      req.body,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res
        .status(403)
        .json({ status: false, message: "Invalid token or id" });
    }

    // Get updated user data
    const { password, ...data } = await User.findById(user._id).lean();

    return res.status(200).json({
      status: true,
      data,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: "Internal Server Error",
    });
  }
};

/**
 * Delete User API (for users)
 * @param {/id, Authorization, data} req
 * @param {status, message} res
 * @returns
 */
exports.deleteUser = async (req, res) => {
  try {
    // Check if request body and password are provided
    if (!req.body || !req.body.password) {
      return res.status(400).json({
        status: false,
        message: "Please enter all data",
      });
    }

    // Check if password is a string
    if (typeof req.body.password !== "string") {
      return res
        .status(400)
        .json({ status: false, message: "Password must be a string" });
    }

    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res
        .status(403)
        .json({ status: false, message: "Invalid token or password" });
    }

    const userToken = authHeader && authHeader.split(" ")[1];
    if (!userToken) {
      return res
        .status(403)
        .json({ status: false, message: "Invalid token or password" });
    }

    // Find user by ID
    const id = await User.findById(req.params.id);
    if (!id) {
      return res.status(400).json({
        status: false,
        error: "User not found",
      });
    }

    const userID = id._id;

    // Verify the JWT token
    await verifyJwt(userToken, process.env.APP_KEY);

    // Check if the user associated with the token and ID exists
    const getData = await User.findOne({ token: userToken, _id: userID });
    if (!getData) {
      return res
        .status(403)
        .json({ status: false, message: "Invalid token or password" });
    }

    // Compare the provided password with the stored hashed password
    const match = await bcrypt.compare(req.body.password, getData.password);
    if (!match) {
      return res.status(400).json({
        status: false,
        message: "Incorrect token or password",
      });
    }

    // Delete the user
    const deletedUser = await User.findOneAndDelete({
      token: userToken,
      _id: userID,
    });

    if (!deletedUser) {
      return res
        .status(403)
        .json({ status: false, message: "Invalid token or password" });
    }

    return res.status(200).json({
      status: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: "Internal Server Error",
    });
  }
};
