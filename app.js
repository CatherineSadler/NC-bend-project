const express = require("express");
const app = express();
const { getCategories, getReviews } = require("./controllers/controller.js");

app.use(express.json());

app.get("/api/categories", getCategories);
app.get("/api/reviews", getReviews);

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send("server error!");
});

module.exports = app;
