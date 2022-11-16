const express = require("express");
const app = express();
const {
  getCategories,
  getReviews,
  getReviewsById,
  getCommentsByReviewId,
  postCommentsByReviewId,
  getUsers,
  patchReviewVotesById,
} = require("./controllers/controller.js");

app.use(express.json());

app.get("/api/categories", getCategories);
app.get("/api/reviews", getReviews);
app.get("/api/reviews/:review_id", getReviewsById);
app.get("/api/reviews/:review_id/comments", getCommentsByReviewId)
app.post("/api/reviews/:review_id/comments", postCommentsByReviewId)
app.get("/api/reviews/:review_id/comments", getCommentsByReviewId);
app.patch("/api/reviews/:review_id", patchReviewVotesById)
app.get("/api/users", getUsers)

app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
});

app.use((err,req,res,next) => {
  if (err.code === "23503") {
    const errorValue = err.detail.match(/\(([^\(]*)\)/g)[1].slice(1, -1);
    if (err.detail.startsWith("Key (author)=")) {
      res.status(400).send({msg: `user ${errorValue} does not exist`})
    }
    if (err.detail.startsWith("Key (review_id)=")) {
      res.status(404).send({msg: `Review ${errorValue} not found`})
    }
  } 

    else if (err.code === '22P02') {
        res.status(400).send({msg:'Invalid data type'})
    }
    else if (err.code === '23502') {
      res.status(400).send({msg:'Incomplete object on body'})
    }
    else{
        next(err)
    }
})
app.use((err, req, res, next) => {
  if (err.code === '22P02') {
    res.status(400).send({msg:'Invalid data type'})
}
else if (err.code === '23502') {
  res.status(400).send({msg: 'Incomplete object on body'})
}
  else next(err)
});

app.use((err, req, res, next) => {
  console.log(err)
  res.status(500).send("server error!");
});

module.exports = app;
