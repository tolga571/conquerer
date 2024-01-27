const pool = require("../config/db"); // PostgreSQL bağlantısı
const bcrypt = require("bcrypt");

const account = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Kullanıcının hesap bilgilerini getir
    const user = await pool.query(
      "SELECT id, full_name, email, username FROM users WHERE id = $1",
      [userId]
    );

    res.json(user.rows[0]);
  } catch (error) {
    console.error("Error getting account information:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.userId;

    // Kullanıcıyı e-posta adresine göre bul
    const user = await pool.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);

    // Eski şifre uyuşmuyorsa hata döndür
    if (!(await bcrypt.compare(oldPassword, user.rows[0].password))) {
      return res.status(401).json({ error: "Invalid old password" });
    }

    // Yeni şifreyi güvenli bir şekilde hashle
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Yeni şifreyi veritabanında güncelle
    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [
      hashedNewPassword,
      userId,
    ]);

    // Oturumu sonlandır
    // Bu adım gerçek bir uygulama için JWT'yi karaliste tablosuna ekleyerek veya ilgili oturumu geçersiz kılacak başka bir yöntem kullanarak değişebilir.
    const token = req.header("Authorization");

    // Token'ı PostgreSQL karaliste tablosuna ekleyerek geçersiz kılma işlemi
    await pool.query("INSERT INTO token_blacklist (token) VALUES ($1)", [
      token,
    ]);

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Hesaba ait blog yazılarını ve yorumlarını sil
    await pool.query("DELETE FROM posts WHERE user_id = $1", [userId]);
    await pool.query("DELETE FROM comments WHERE user_id = $1", [userId]);

    // Kullanıcıyı veritabanından sil
    await pool.query("DELETE FROM users WHERE id = $1", [userId]);

    // Oturumu sonlandır
    // Bu adım gerçek bir uygulama için JWT'yi karaliste tablosuna ekleyerek veya ilgili oturumu geçersiz kılacak başka bir yöntem kullanarak değişebilir.

    const token = req.header("Authorization");

    // Token'ı PostgreSQL karaliste tablosuna ekleyerek geçersiz kılma işlemi
    await pool.query("INSERT INTO token_blacklist (token) VALUES ($1)", [
      token,
    ]);

    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  account,
  changePassword,
  deleteAccount
};
