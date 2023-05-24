const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const User = require("../model/user");

exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.create({
    email,
    password,
  });

  const token = user.getJwtToken();

  if (!token) {
    next(new ErrorHandler("Invalid User.", 401));
  }

  res.status(201).json({
    success: true,
    token,
  });
});

exports.resetAccessToken = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  const token = user.getJwtToken();

  res.status(201).json({
    success: true,
    token,
  });
});
