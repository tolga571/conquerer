const { Client } = require("@elastic/elasticsearch");
const fs = require("fs");

// Elasticsearch bağlantı bilgileri
const elasticClient = new Client({
  node: "https://d67a75fa14bc4e45bc6455b172519ec5.us-central1.gcp.cloud.es.io:443", // Elasticsearch node URL
  cloud: {
    id: "0164d8bcd1ce4d4a807ffb2f00ef843f:dXMtY2VudHJhbDEuZ2NwLmNsb3VkLmVzLmlvJGQ2N2E3NWZhMTRiYzRlNDViYzY0NTViMTcyNTE5ZWM1JGZiNWUzZjg1ZDJmNTRkMGQ5ZWM4ZjczMzMwOTIzMjZk", // Elastic Cloud ID
  },
  auth: {
    username: "elastic", // Elasticsearch kullanıcı adınız
    password: "TOmNxJKIA5C6iG8BtfMpY0MF", // Elasticsearch şifreniz // TOmNxJKIA5C6iG8BtfMpY0MF
  },
});

// Index adı
const indexName = "search-posts";

// JSON dosyasından veri okuma
const postData = JSON.parse(fs.readFileSync("posts.json", "utf8"));

// Verileri Elasticsearch'e eklemek için fonksiyon
async function indexPosts() {
  try {
    // Index oluştur
    await elasticClient.indices.create({
      index: indexName,
      body: {
        mappings: {
          properties: {
            id: { type: "keyword" },
            profile: {
              properties: {
                full_name: { type: "text" },
                address: { type: "text" },
                location: {
                  properties: {
                    lat: { type: "float" },
                    long: { type: "float" },
                  },
                },
                email: { type: "keyword" },
                username: { type: "keyword" },
              },
            },
            category: { type: "keyword" },
            body: { type: "keyword" },
            title: { type: "keyword" },
            createdAt: { type: "date" },
            updatedAt: { type: "date" },
          },
        },
      },
    });

    // Verileri index'e ekle
    for (const post of postData) {
      await elasticClient.index({
        index: indexName,
        body: post,
      });
      console.log(post)
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
//indexPosts();
