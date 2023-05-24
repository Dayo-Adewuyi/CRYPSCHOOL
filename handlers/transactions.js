const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const { sendTransaction, getBalance } = require("../utils/sendTransaction");

exports.exchangeToken = catchAsyncErrors(async (req, res, next) => {
  // if (req.user.email !== process.env.ADMIN_EMAIL) {
  //   return next(new ErrorHandler("Invalid User.", 401));
  // }
  const { points, to } = req.body;

  const transfer = await sendTransaction(points, to);

  if (!transfer) {
    return next(new ErrorHandler("Invalid Transaction.", 401));
  }

  res.status(201).json({
    success: true,
    transfer,
  });
});

exports.getBalance = catchAsyncErrors(async (req, res, next) => {
  const { address } = req.params;

  const balance = await getBalance(address);

  if (!balance) {
    return next(new ErrorHandler("Invalid Address.", 401));
  }

  res.status(201).json({
    success: true,
    balance,
  });
});
