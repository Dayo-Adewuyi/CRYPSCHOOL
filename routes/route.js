const express = require("express");
const { isAuthenticatedUser } = require("../middlewares/auth");
const router = express.Router();

const { registerUser, resetAccessToken } = require("../handlers/auth");
const { exchangeToken, getBalance } = require("../handlers/transactions");

router.post("/register", registerUser);
router.post("/resetAccessToken", resetAccessToken);

router.post("/exchangeToken", isAuthenticatedUser, exchangeToken);
router.get("/getBalance/:address", isAuthenticatedUser, getBalance);

module.exports = router;
