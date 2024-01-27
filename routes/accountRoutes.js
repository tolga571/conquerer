const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth.js");
const {
  account,
  changePassword,
  deleteAccount,
} = require("../controllers/account.controller.js");

router.get("/account", verifyToken, account);

router.post("/change-password", verifyToken, changePassword);

router.delete("/delete-account", verifyToken, deleteAccount);

module.exports = router;
