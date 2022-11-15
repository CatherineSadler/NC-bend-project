const express = require("express");
const app = express();
const {
  getCategories,
  getReviews,
  getReviewsById,
  getCommentsByReviewId,
  postCommentsByReviewId
} = require("./controllers/controller.js");

app.use(express.json());

app.get("/api/categories", getCategories);
app.get("/api/reviews", getReviews);
app.get("/api/reviews/:review_id", getReviewsById);
app.get("/api/reviews/:review_id/comments", getCommentsByReviewId)
app.post("/api/reviews/:review_id/comments", postCommentsByReviewId)



app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
});

app.use((err,req,res,next) => {
    if (err.code === '22P02') {
        res.status(400).send({msg:'Invalid data type'})
    }
    else{
        next(err)
    }
})

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send("server error!");
});

module.exports = app;
