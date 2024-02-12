const User = require("../models/userModel");
const { generateToken } = require("../utils/generateToken.js");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
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
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find().select("-__v");
  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
});
exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError("No User found with that ID", 404));
  }
  //User.findOne({_id: req.params.id})
  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});
exports.createUser = catchAsync(async (req, res, next) => {
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
});
exports.updateUser = catchAsync(async (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) {
    return next(new AppError("You should specify user token", 400));
  }
  token = token.split(" ")[1];
  const tokenUser = jwt.verify(token, process.env.JWT_SECRET_KEY);
  console.log(tokenUser);
  const user = await User.findByIdAndUpdate(tokenUser.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    return next(new AppError("No User found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});
exports.deleteUser = async (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) {
    return next(new AppError("You should specify user token", 400));
  }
  token = token.split(" ")[1];
  const tokenUser = jwt.verify(token, process.env.JWT_SECRET_KEY);
  const user = await User.findByIdAndDelete(tokenUser.id);
  if (!user) {
    return next(new AppError("User not found", 404));
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
};
exports.login = catchAsync(async (req, res, next) => {
  const { email, password, username } = req.body;
  if (!email || !password) {
    return next(new AppError("Email and password are required", 404));
  }
  const user = await User.findOne({
    $or: [{ email: email }, { username: username }],
    password: password,
  });
  if (!user) {
    return next(new AppError("Email or password is incorrect", 404));
  }
  const token = await generateToken({
    email: user.email,
    id: user._id,
  });

  res.status(200).json({
    status: "success",
    data: {
      user,
      token,
    },
  });
});

exports.forgetPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("No User found with that Email", 404));
  }
  const verificationCode = crypto.randomBytes(3).toString("hex").toUpperCase();
  user.verificationCode = verificationCode;

  await user.save();
  sendVerificationEmail(email, verificationCode);
  res.status(200).json({
    message: "Verification code sent successfully",
  });
});
exports.verifyCode = catchAsync(async (req, res, next) => {
  const { email, verificationCode } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError("No User found with that Email", 404));
  }

  if (user.verificationCode !== verificationCode) {
    return next(new AppError("Invalid verification code", 400));
  }

  user.verificationCode = null;
  await user.save();

  res.status(200).json({
    status: "success",
    message: "Verification successful",
  });
});
