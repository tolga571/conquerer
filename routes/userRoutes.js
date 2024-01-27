const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth.js");
const {
  getUser,
  userRegister,
  login,
  logout,
  myPosts,
  myComments,
} = require("../controllers/user.controller.js");

router.post("/register", userRegister);

router.post("/login", login);

router.post("/logout", verifyToken, logout);

// routes/userRoutes.js
router.get("/my-comments", verifyToken, myComments);

// routes/userRoutes.js
router.get("/my-posts", verifyToken, myPosts);

router.get("/all-users", getUser);

module.exports = router;
