const { Client } = require("@elastic/elasticsearch");
const config = require("config");
const elasticConfig = config.get("elastic");

const elasticClient = new Client({
  node: "https://d67a75fa14bc4e45bc6455b172519ec5.us-central1.gcp.cloud.es.io:443",
  cloud: {
    id: "conquerer_deploy:dXMtY2VudHJhbDEuZ2NwLmNsb3VkLmVzLmlvOjQ0MyRkNjdhNzVmYTE0YmM0ZTQ1YmM2NDU1YjE3MjUxOWVjNSRmYjVlM2Y4NWQyZjU0ZDBkOWVjOGY3MzMzMDkyMzI2ZA==",
  },
  auth: {
    username: "elastic",
    password: "TOmNxJKIA5C6iG8BtfMpY0MF",
  },
});

const testElasticsearchConnection = async () => {
  try {
    await elasticClient.ping();
    console.log("Elasticsearch connected 🎯");
  } catch (error) {
    console.error(
      "Elasticsearch connect error:",
      error.meta ? error.meta.body.error : error.message
    );
  }
};

testElasticsearchConnection();

module.exports = elasticClient;
