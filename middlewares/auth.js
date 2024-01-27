const jwt = require("jsonwebtoken");
const pool = require("../config/db.js");

const verifyToken = async (req, res, next) => {
  const token = req.header("Authorization");

  if (!token)
    return res.status(401).json({ error: "Access denied. Token is required." });

  try {
    // Token'ın geçerliliğini kontrol et
    const verified = jwt.verify(token, "your_secret_key");
    req.user = verified;

    // PostgreSQL karaliste kontrolü
    const result = await pool.query(
      "SELECT * FROM token_blacklist WHERE token = $1",
      [token]
    );

    if (result.rows.length > 0) {
      // Token karaliste içinde, geçersiz say
      return res.status(401).json({ error: "Invalid token" });
    } else {
      // Token karalistede değil, devam et
      next();
    }
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = { verifyToken };
