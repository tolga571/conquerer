// insertData.js
const fs = require("fs");
const pool = require("./config/db");
const bcrypt = require("bcrypt");

const insertUsers = async () => {
  try {
    const usersData = JSON.parse(fs.readFileSync("users.json", "utf-8"));
    const client = await pool.connect();

    usersData.forEach(async (user) => {
      const result = await client.query(
        "INSERT INTO users (full_name, address, email, username, location) VALUES ($1, $2, $3, $4, $5::jsonb)",
        [user.full_name, user.address, user.email, user.username, user.location]
      );

      console.log("User inserted:", result.rows[0]);
    });

    client.release();

    console.log("All users inserted successfully.");
  } catch (error) {
    console.error("Error inserting users:", error);
  }
};

const insertPosts = async () => {
  try {
    const postsData = JSON.parse(fs.readFileSync("posts.json", "utf-8"));
    const client = await pool.connect();

    postsData.forEach(async (post) => {
      const result = await client.query(
        "INSERT INTO posts (id, category, body, title, created_at, updated_at, profile) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        [
          post.id,
          post.category,
          post.body,
          post.title,
          post.createdAt,
          post.updatedAt,
          JSON.stringify(post.profile),
        ]
      );

      console.log("Post inserted:", result.rows[0]);
    });

    client.release();
    console.log("All posts inserted successfully.");
  } catch (error) {
    console.error("Error inserting posts:", error);
  }
};

const insertPassword = async () => {
  const getUsersQuery = "SELECT * FROM users";
  const result = await pool.query(getUsersQuery);
  const users = result.rows;

  for (let user of users) {
    // Kullanıcının şifresi geçerli mi kontrolü
    if (!user.password) {
      // Boş olan password alanlarına varsayılan bir şifre atayın
      const defaultPassword = "defaultPassword"; // Varsayılan şifre değeri
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      const updateQuery = "UPDATE users SET password = $1 WHERE id = $2";
      await pool.query(updateQuery, [hashedPassword, user.id]);
    }
  }
};

async function updatePostsUserIds() {
  try {
    const query = `
      UPDATE posts
      SET user_id = users.id
      FROM users
      WHERE posts.profile->>'username' = users.username
        AND posts.user_id IS NULL
    `;

    const result = await pool.query(query);
    console.log("User IDs updated successfully in posts table.");
  } catch (error) {
    console.error("Error updating user IDs in posts table:", error);
  } finally {
    pool.end(); // Bağlantıyı kapatmayı unutmayın
  }
}

updatePostsUserIds();

// insertPassword();
// insertUsers();
// insertPosts();
