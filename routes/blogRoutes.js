// routes/blogRoutes.js
const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth.js");
const {
  getPosts,
  updatePost,
  deletePost,
  getPost,
  createPost,
  addComment,
  lastPosts,
  postByCategory,
  searchPosts,
} = require("../controllers/blog.controller.js");

router.post("/create-post", verifyToken, createPost);

router.get("/get-posts", verifyToken, getPosts);

// routes/blogRoutes.js
router.put("/update-post/:postId", verifyToken, updatePost);

// routes/blogRoutes.js
router.delete("/delete-post/:postId", verifyToken, deletePost);

// routes/blogRoutes.js
router.get("/get-post/:postId", getPost);

// routes/blogRoutes.js
router.post("/add-comment/:postId", verifyToken, addComment);

// routes/blogRoutes.js
router.get("/last-posts", lastPosts);

// routes/blogRoutes.js
router.get("/posts-by-category/:category", postByCategory);

// routes/blogRoutes.js
router.get("/search-posts/:searchTerm", searchPosts);

module.exports = router;
