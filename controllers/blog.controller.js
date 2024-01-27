const pool = require("../config/db.js"); // PostgreSQL bağlantısı
const generateRandomString = require("../helpers/rondomString.js");

// Kategorilerin tanımlanması
const validCategories = [
  "Artificial Intelligence",
  "Business",
  "Money",
  "Technology",
];

const createPost = async (req, res) => {
  try {
    const { category, title, body } = req.body;
    const userId = req.user.userId;

    // Kategori kontrolü
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: "Invalid category" });
    }

    // Kullanıcının profil bilgilerini al
    const userProfile = await pool.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);

    const randomString = generateRandomString(24);

    // Blog yazısını veritabanına ekle
    const newPost = await pool.query(
      "INSERT INTO posts (user_id, id, category, title, body, profile) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [
        userId,
        randomString,
        category,
        title,
        body,
        userProfile.rows[0], // Kullanıcının profil bilgilerini ekle
      ]
    );

    res.json(newPost.rows[0]);
  } catch (error) {
    console.error("Error creating blog post:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getPosts = async (req, res) => {
  try {
    // Tüm blog gönderilerini getir
    const posts = await pool.query("SELECT * FROM posts");

    res.json(posts.rows);
  } catch (error) {
    console.error("Error getting blog posts:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updatePost = async (req, res) => {
  try {
    const { title, body } = req.body;
    const userId = req.user.userId;
    const postId = req.params.postId;

    // Blog yazısının sahibini kontrol et
    const post = await pool.query(
      "SELECT * FROM posts WHERE id = $1 AND user_id = $2",
      [postId, userId]
    );

    if (!post.rows.length) {
      return res.status(401).json({
        error: "Unauthorized. You do not have permission to update this post.",
      });
    }

    // Şu anki tarih ve saat bilgisini al
    const currentTime = new Date();

    // Blog yazısını güncelle ve updated_at'ı şu anki tarih ve saatle doldur
    const updatedPost = await pool.query(
      "UPDATE posts SET title = $1, body = $2, updated_at = $3 WHERE id = $4 RETURNING *",
      [title, body, currentTime, postId]
    );

    res.json(updatedPost.rows[0]);
  } catch (error) {
    console.error("Error updating blog post:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deletePost = async (req, res) => {
  try {
    const userId = req.user.userId;
    const postId = req.params.postId;

    // Blog yazısının sahibini kontrol et
    const post = await pool.query(
      "SELECT * FROM posts WHERE id = $1 AND user_id = $2",
      [postId, userId]
    );

    if (!post.rows.length) {
      return res.status(401).json({
        error: "Unauthorized. You do not have permission to delete this post.",
      });
    }

    // Blog yazısını silme işlemi (soft-deletion)
    await pool.query("UPDATE posts SET deleted_at = NOW() WHERE id = $1", [
      postId,
    ]);

    // Blog yazısına ait yorumları silme
    await pool.query("DELETE FROM comments WHERE post_id = $1", [postId]);

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting blog post:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getPost = async (req, res) => {
  try {
    const postId = req.params.postId;

    // Belirli bir blog yazısını getir
    const post = await pool.query(
      "SELECT * FROM posts WHERE id = $1 AND deleted_at IS NULL",
      [postId]
    );

    if (!post.rows.length) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Blog yazısına ait yorumları getir
    const comments = await pool.query(
      "SELECT * FROM comments WHERE post_id = $1",
      [postId]
    );

    res.json({ post: post.rows[0], comments: comments.rows });
  } catch (error) {
    console.error("Error getting blog post details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const addComment = async (req, res) => {
  try {
    const { content } = req.body;
    const userId = req.user.userId;
    const postId = req.params.postId;

    // Belirli bir blog yazısını kontrol et
    const post = await pool.query(
      "SELECT * FROM posts WHERE id = $1 AND deleted_at IS NULL",
      [postId]
    );

    if (!post.rows.length) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Yorumu ekleyin
    const newComment = await pool.query(
      "INSERT INTO comments (user_id, post_id, content, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *",
      [userId, postId, content]
    );

    res.json(newComment.rows[0]);
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const lastPosts = async (req, res) => {
  try {
    // Tüm yazıları yeniden-eskiye doğru listele
    const allPosts = await pool.query(
      "SELECT * FROM posts WHERE deleted_at IS NULL ORDER BY created_at DESC"
    );

    res.json(allPosts.rows);
  } catch (error) {
    console.error("Error getting last posts:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const postByCategory = async (req, res) => {
  try {
    const category = req.params.category;

    // Belirli bir kategoriye göre yazıları yeniden-eskiye doğru listele
    const categoryPosts = await pool.query(
      "SELECT * FROM posts WHERE category = $1 AND deleted_at IS NULL ORDER BY created_at DESC",
      [category]
    );

    res.json(categoryPosts.rows);
  } catch (error) {
    console.error("Error getting posts by category:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const searchPosts = async (req, res) => {
  try {
    const searchTerm = req.params.searchTerm;

    // Başlık üzerinden arama yap
    const searchResults = await pool.query(
      "SELECT * FROM posts WHERE title ILIKE $1 AND deleted_at IS NULL ORDER BY created_at DESC",
      [`%${searchTerm}%`]
    );

    res.json(searchResults.rows);
  } catch (error) {
    console.error("Error searching posts:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  getPosts,
  updatePost,
  deletePost,
  getPost,
  createPost,
  addComment,
  lastPosts,
  postByCategory,
  searchPosts,
};
