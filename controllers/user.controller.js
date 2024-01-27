const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const pool = require("../config/db.js"); // PostgreSQL bağlantısı

const getUser = async (req, res) => {
  try {
    // Tüm kullanıcıları getir
    const allUsers = await pool.query("SELECT * FROM users");

    res.json(allUsers.rows);
  } catch (error) {
    console.error("Error getting all users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const userRegister = async (req, res) => {
  try {
    const { full_name, address, email, username, password } = req.body;

    // Kullanıcı var mı yok mu kontrolü (e-posta adresi üzerinden)
    const checkUserQuery = "SELECT * FROM users WHERE email = $1";
    const existingUser = await pool.query(checkUserQuery, [email]);

    if (existingUser.rows.length > 0) {
      return res.status(400).send("Bu e-posta adresi zaten kullanımda.");
    }

    // Şifreyi hash'leme
    const hashedPassword = await bcrypt.hash(password, 10);

    // Kullanıcıyı PostgreSQL veritabanına ekleme
    const insertUserQuery =
      "INSERT INTO users (full_name, address, email, username, password) VALUES ($1, $2, $3, $4, $5)";
    const insertUserValues = [
      full_name,
      address,
      email,
      username,
      hashedPassword,
    ];

    await pool.query(insertUserQuery, insertUserValues);

    res.status(201).send("Kullanıcı kaydı başarıyla oluşturuldu.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Bir hata oluştu.");
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kullanıcı var mı kontrolü (e-posta adresi üzerinden)
    const getUserQuery = "SELECT * FROM users WHERE email = $1";
    const result = await pool.query(getUserQuery, [email]);

    const user = result.rows[0];

    if (!user) {
      return res.status(401).send("Kullanıcı bulunamadı.");
    }

    // Şifre karşılaştırma
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (isPasswordMatch) {
      // Kullanıcı girişi başarılı, JWT üret ve kullanıcıya gönder
      const token = jwt.sign({ userId: user.id }, "your_secret_key", {
        expiresIn: "999h",
      });
      res.status(200).json({ token });
    } else {
      res.status(401).send("Kullanıcı adı veya şifre hatalı.");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Bir hata oluştu.");
  }
};

const logout = async (req, res) => {
  try {
    const userId = req.user.userId;
    const token = req.header("Authorization");

    // Token'ı PostgreSQL karaliste tablosuna ekleyerek geçersiz kılma işlemi
    await pool.query("INSERT INTO token_blacklist (token) VALUES ($1)", [
      token,
    ]);

    res.json({ message: "Logout successful" });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const myPosts = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Kullanıcının oluşturduğu yazıları getir
    const userPosts = await pool.query(
      "SELECT * FROM posts WHERE user_id = $1 AND deleted_at IS NULL",
      [userId]
    );

    res.json(userPosts.rows);
  } catch (error) {
    console.error("Error getting user posts:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const myComments = async (req, res) => {
    try {
      const userId = req.user.userId;
  
      // Kullanıcının yapmış olduğu yorumları getir
      const userComments = await pool.query(
        "SELECT * FROM comments WHERE user_id = $1",
        [userId]
      );
  
      res.json(userComments.rows);
    } catch (error) {
      console.error("Error getting user comments:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

module.exports = {
  getUser,
  userRegister,
  login,
  logout,
  myPosts,
  myComments
};
