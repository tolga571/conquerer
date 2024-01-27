// routes/elasticsearchRoutes.js
const express = require("express");
const router = express.Router();
const elasticEndpoints = require("../esEndpoint/elastichSearchEndpoints.js");

// Tüm kullanıcıları getirme
router.get("/get-all-users", async (req, res) => {
  try {
    const users = await elasticEndpoints.getAllUsersFromElasticsearch();
    res.json(users);
  } catch (error) {
    console.error("Error getting all users from Elasticsearch:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Belirli bir kullanıcıyı getirme
router.get("/get-user/:param", async (req, res) => {
  const param = req.params.param;
  console.log(param);

  try {
    const user = await elasticEndpoints.getUserByUsernameFromElasticsearch(
      param
    );
    res.json(user);
  } catch (error) {
    console.error(
      `Error getting user with ID ${param} from Elasticsearch:`,
      error
    );
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Belirli bir kategoriye ait yazıları getirme
router.get("/get-posts-by-category/:category", async (req, res) => {
  const category = req.params.category;

  try {
    const posts = await elasticEndpoints.getPostsByCategoryFromElasticsearch(
      category
    );
    res.json(posts);
  } catch (error) {
    console.error(
      `Error getting posts by category ${category} from Elasticsearch:`,
      error
    );
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/category-rates", async (req, res) => {
  try {
    const result = await elasticEndpoints.getCategoryRates();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Kullanıcı istatistikleri
router.get("/user-stats", async (req, res) => {
  try {
    const userStats = await elasticEndpoints.getUserStats();
    res.json(userStats);
  } catch (error) {
    console.error("Error getting user stats:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/getPostWeek/:startDate/:endDate", async (req, res) => {
  const { startDate, endDate } = req.params;

  try {
    const result = await elasticEndpoints.getPostByWeek(startDate, endDate);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/getPostMonth/:startDate/:endDate", async (req, res) => {
  const { startDate, endDate } = req.params;

  try {
    const result = await elasticEndpoints.getPostByMonth(startDate, endDate);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/getPostYear/:startDate/:endDate", async (req, res) => {
  const { startDate, endDate } = req.params;

  try {
    const result = await elasticEndpoints.getPostByYear(startDate, endDate);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
