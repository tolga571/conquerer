const { Client } = require("@elastic/elasticsearch");
const fs = require("fs");

// Elasticsearch bağlantı bilgileri
const elasticClient = new Client({
  node: "https://d67a75fa14bc4e45bc6455b172519ec5.us-central1.gcp.cloud.es.io:443",
  cloud: {
    id: "0164d8bcd1ce4d4a807ffb2f00ef843f:dXMtY2VudHJhbDEuZ2NwLmNsb3VkLmVzLmlvJGQ2N2E3NWZhMTRiYzRlNDViYzY0NTViMTcyNTE5ZWM1JGZiNWUzZjg1ZDJmNTRkMGQ5ZWM4ZjczMzMwOTIzMjZk", // Elastic Cloud ID
  },
  auth: {
    username: "elastic", // Elasticsearch kullanıcı adınız
    password: "TOmNxJKIA5C6iG8BtfMpY0MF", // Elasticsearch şifreniz
  },
});

// Index adı
const indexName = "users_";

// JSON dosyasından veri okuma
const userData = JSON.parse(fs.readFileSync("users.json", "utf8"));

// Verileri Elasticsearch'e eklemek için fonksiyon
async function indexUsers() {
  try {
    await elasticClient.indices.create({
      index: indexName,
      body: {
        mappings: {
          properties: {
            address: {
              type: "text",
            },
            email: {
              type: "keyword",
            },
            full_name: {
              type: "text",
            },
            location: {
              properties: {
                lat: {
                  type: "float",
                },
                long: {
                  type: "float",
                },
              },
            },
            username: {
              type: "keyword",
            },
          },
        },
      },
    });
    // Verileri index'e ekle
    for (const user of userData) {
      await elasticClient.index({
        index: indexName,
        body: user,
      });
      console.log(user);
    }

    console.log("Veriler Elasticsearch index'ine başarıyla eklendi.");
  } catch (error) {
    console.error("Hata:", error);
  } finally {
    // Elasticsearch bağlantısını kapat
    elasticClient.close();
  }
}

// Verileri Elasticsearch'e ekleme işlemi başlat
//indexUsers();
