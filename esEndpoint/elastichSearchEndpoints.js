const elasticClient = require("../config/esDb.js");

const indexName = "users_"; // Elasticsearch index adı

// http://localhost:3000/api/elastic/get-all-users
const getAllUsersFromElasticsearch = async () => {
  try {
    const result = await elasticClient.search({
      index: indexName,
      body: {
        query: {
          match_all: {},
        },
      },
    });

    const docs = result.hits.hits.map((hit) => hit._source);
    return docs;
  } catch (error) {
    console.error(
      "Error in getAllUsersFromElasticsearch:",
      error.meta ? error.meta.body.error : error.message
    );
    throw error;
  }
};

// Belirli bir kullanıcıyı Elasticsearch'ten getirme
const getUserByUsernameFromElasticsearch = async (username) => {
  const response = await elasticClient.search({
    index: 'users_', // uygun index adını kullanın
    body: {
      query: {
        match: {
          username: username
        }
      }
    }
  });

  // Elde edilen kullanıcıyı döndürün
  return response.hits.hits.map(hit => hit._source);
};

// Belirli bir kategoriye ait yazıları Elasticsearch'ten getirme
const getPostsByCategoryFromElasticsearch = async (category) => {
  try {
    const body = await elasticClient.search({
      index: "search-posts",
      body: {
        query: {
          match: {
            category: category,
          },
        },
      },
    });

    return body.hits.hits.map((hit) => hit._source);
  } catch (error) {
    throw error;
  }
};

const getCategoryRates = async () => {
  try {
    const body = await elasticClient.search({
      index: 'search-posts',
      body: {
        aggs: {
          category_percentage: {
            terms: {
              field: 'category',
            },
          },
        },
      },
    });

    if (!body.aggregations || !body.aggregations.category_percentage) {
      throw new Error('Invalid response structure from Elasticsearch');
    }

    const totalPosts = body.hits.total.value;
    const categoryBuckets = body.aggregations.category_percentage.buckets || [];

    if (categoryBuckets.length === 0) {
      throw new Error('No category data found.');
    }

    const result = categoryBuckets.map(bucket => ({
      category: bucket.key,
      percentage: (bucket.doc_count / totalPosts) * 100,
    }));

    return result;
  } catch (error) {
    throw error;
  }
};

const getUserStats = async () => {
  try {
    // Elasticsearch sorgusu: Tüm kullanıcıları ve postları getir
    const usersResult = await elasticClient.search({
      index: 'users_',
      body: {
        query: {
          match_all: {},
        },
        size:2000
      }
    });

    const postsResult = await elasticClient.search({
      index: 'search-posts',
      body: {
        query: {
          match_all: {},
        },
        size:2000
      }
    });

    console.log(postsResult.hits.hits.map(post => post._source.profile.username))

   // Kullanıcıları ve postları eşleştirerek blogger ve reader sayılarını bul
   const bloggerUsernames = new Set(postsResult.hits.hits.map(post => post._source.profile.username));
   const totalUsers = usersResult.hits.total.value;
   const bloggerCount = Array.from(bloggerUsernames).length;
   const readerCount = totalUsers - bloggerCount;

   return {
     totalUsers,
     bloggerCount,
     readerCount,
   };
 } catch (error) {
   throw error;
 }
};

const getPostByWeek = async (startDate, endDate) => {
  try {
    const body = await elasticClient.search({
      index: 'search-posts',
      body: {
        query: {
          range: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
        aggs: {
          days: {
            date_histogram: {
              field: 'createdAt',
              calendar_interval: 'day',
              format: 'yyyy-MM-dd', // Gün bazında gruplama için format belirtin
            },
            aggs: {
              categories: {
                terms: {
                  field: 'category',
                },
              },
            },
          },
        },
      },
    });

    const days = body.aggregations.days.buckets.map((day) => {
      const categories = day.categories.buckets.map((category) => ({
        categoryName: category.key,
        postCount: category.doc_count,
      }));

      return {
        date: day.key_as_string,
        postCount: day.doc_count,
        categories: categories,
      };
    });

    const totalPosts = body.hits.total.value;

    if (totalPosts > 0) {
      console.log(`Toplam ${totalPosts} adet post bulundu.`);
    } else {
      console.log('Hiç post bulunamadı.');
    }

    const result = {
      totalPosts,
      days,
      posts: body.hits.hits.map((hit) => hit._source),
    };

    return result;
  } catch (error) {
    throw error;
  }
};

const getPostByMonth = async (startMonth, endMonth) => {
  try {
    const body = await elasticClient.search({
      index: 'search-posts',
      body: {
        query: {
          range: {
            createdAt: {
              gte: startMonth,
              lte: endMonth,
            },
          },
        },
        aggs: {
          months: {
            date_histogram: {
              field: 'createdAt',
              calendar_interval: 'month',
              format: 'yyyy-MM', // Ay bazında gruplama için format belirtin
            },
            aggs: {
              categories: {
                terms: {
                  field: 'category',
                },
              },
            },
          },
        },
      },
    });

    const months = body.aggregations.months.buckets.map((month) => {
      const categories = month.categories.buckets.map((category) => ({
        categoryName: category.key,
        postCount: category.doc_count,
      }));

      return {
        month: month.key_as_string,
        postCount: month.doc_count,
        categories: categories,
      };
    });

    const totalPosts = body.hits.total.value;

    if (totalPosts > 0) {
      console.log(`Toplam ${totalPosts} adet post bulundu.`);
    } else {
      console.log('Hiç post bulunamadı.');
    }

    const result = {
      totalPosts,
      months,
      posts: body.hits.hits.map((hit) => hit._source),
    };

    return result;
  } catch (error) {
    throw error;
  }
};

const getPostByYear = async (startYear, endYear) => {
  try {
    const body = await elasticClient.search({
      index: 'search-posts',
      body: {
        query: {
          range: {
            createdAt: {
              gte: startYear,
              lte: endYear,
            },
          },
        },
        aggs: {
          years: {
            date_histogram: {
              field: 'createdAt',
              calendar_interval: 'year',
              format: 'yyyy', // Yıl bazında gruplama için format belirtin
            },
            aggs: {
              categories: {
                terms: {
                  field: 'category',
                },
              },
            },
          },
        },
      },
    });

    const years = body.aggregations.years.buckets.map((year) => {
      const categories = year.categories.buckets.map((category) => ({
        categoryName: category.key,
        postCount: category.doc_count,
      }));

      return {
        year: year.key_as_string,
        postCount: year.doc_count,
        categories: categories,
      };
    });

    const totalPosts = body.hits.total.value;

    if (totalPosts > 0) {
      console.log(`Toplam ${totalPosts} adet post bulundu.`);
    } else {
      console.log('Hiç post bulunamadı.');
    }

    const result = {
      totalPosts,
      years,
      posts: body.hits.hits.map((hit) => hit._source),
    };

    return result;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getAllUsersFromElasticsearch,
  getUserByUsernameFromElasticsearch,
  getPostsByCategoryFromElasticsearch,

  getCategoryRates,
  getUserStats,
  getPostByWeek,
  getPostByMonth,
  getPostByYear
};