const express = require("express");
const app = express();
const { getCategories, getReviews, getReviewsById } = require("./controllers/controller.js");

app.use(express.json());

app.get("/api/categories", getCategories);
app.get("/api/reviews", getReviews);
app.get("/api/reviews/:review_id", getReviewsById);


app.use((err,req,res,next) => {
    if (err.status && err.msg) {
        res.status(err.status).send({msg: err.msg})
    }
    else {
        next(err)
    }
})

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send("server error!");
});

module.exports = app;
