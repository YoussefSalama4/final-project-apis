const User = require("../models/userModel");
const { generateToken } = require("../utils/generateToken.js");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const sendVerificationEmail = function (email, verificationCode) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "mohamedabdelkader01022856467@gmail.com", // replace with your email
      pass: "midf ijwc oxfb osmz", // replace with your password or use an app-specific password
    },
  });

  const mailOptions = {
    from: "mohamedabdelkader01022856467@gmail.com",
    to: email,
    subject: "Password Reset Verification Code",
    text: `Your verification code is: ${verificationCode}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      // console.error(error);
      console.log(email);
    } else {
      console.log(email);
      console.log("Email sent: " + info.response);
    }
  });
};
// Want Edit
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-__v");
    res.status(200).json({
      status: "success",
      results: users.length,
      data: {
        users,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    //User.findOne({_id: req.params.id})
    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};
exports.createUser = async (req, res) => {
  try {
    const newUser = new User({
      ...req.body,
    });
    // Generate web token
    const token = await generateToken({
      email: newUser.email,
      id: newUser._id,
    });
    newUser.token = token;
    await newUser.save();
    res.status(201).json({
      status: "success",
      data: {
        user: newUser,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};
exports.updateUser = async (req, res) => {
  try {
    const token = req.headers["authorization"].split(" ")[1];
    const tokenUser = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log(tokenUser);
    const user = await User.findByIdAndUpdate(tokenUser.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};
exports.deleteUser = async (req, res) => {
  try {
    const token = req.headers["authorization"].split(" ")[1];
    const tokenUser = jwt.verify(token, process.env.JWT_SECRET_KEY);
    await User.findByIdAndDelete(tokenUser.id);
    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};
exports.login = async (req, res) => {
  try {
    const { email, password, username } = req.body;
    if (!email && !password) {
      return res.status(400).json({
        status: "Error",
        Error: "Email and password required",
      });
    }
    const user = await User.findOne({
      $or: [{ email: email }, { username: username }],
      password: password,
    });
    if (!user) {
      return res.status(404).json({
        status: "Error",
        data: {
          Error: "This account isn't found",
        },
      });
    }
    const token = await generateToken({
      email: user.email,
      id: user._id,
    });
    if (user)
      res.status(200).json({
        status: "success",
        data: {
          user,
          token,
        },
      });
    else {
      return res.status(400).json({
        status: "Error",
        data: {
          Error: "Email or password are not correct try again",
        },
      });
    }
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};

exports.forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Generate a random verification code
    const verificationCode = crypto
      .randomBytes(3)
      .toString("hex")
      .toUpperCase();

    // Save the user with the updated verification code
    user.verificationCode = verificationCode;

    // Save the user with the updated verification code
    await user.save();
    sendVerificationEmail(email, verificationCode);
    res.status(200).json({
      message: "Verification code sent successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
exports.verifyCode = async (req, res) => {
  try {
    const { email, verificationCode } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the provided verification code matches the one stored in the database
    if (user.verificationCode !== verificationCode) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    // Clear the verification code after successful verification (optional)
    user.verificationCode = null;
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Verification successful",
    });
  } catch (error) {
    console.error("Internal server error:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};
