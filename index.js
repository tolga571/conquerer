// index.js
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const cors = require("cors");

const bodyParser = require("body-parser");

const blogRoute = require("./routes/blogRoutes.js");
const userRoute = require("./routes/userRoutes.js");
const accountRoute = require("./routes/accountRoutes.js");

const elasticsearchRoutes = require('./esRoutes/elastichsearchRoutes.js');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/blogdetail", blogRoute);
app.use("/api/users", userRoute);
app.use("/api/account", accountRoute);

app.use('/api/elastic', elasticsearchRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});