const {
  selectCategories,
  selectReviews,
  selectReviewsById,
  selectCommentsByReviewId,
  insertIntoCommentsByReviewId
} = require("../models/model.js");

exports.getCategories = (req, res, next) => {
  return selectCategories()
    .then((categories) => {
      res.status(200).send({ categories: categories });
    })
    .catch(next);
};

exports.getReviews = (req, res, next) => {
  return selectReviews()
    .then((reviews) => {
      res.send({ reviews });
    })
    .catch(next);
};

exports.getReviewsById = (req, res, next) => {
  return selectReviewsById(req.params.review_id)
    .then((review) => {
      res.send({ review });
    })
    .catch(next);
};

exports.getCommentsByReviewId = (req, res, next) => {
  return selectCommentsByReviewId(req.params.review_id)
    .then((comments) => {
      res.send({ comments });
    })
    .catch(next);
};

exports.postCommentsByReviewId = (req,res,next) => {
  const body = req.body.body;
  const username = req.body.username;
  const review_id = req.params.review_id;
 insertIntoCommentsByReviewId(body, username, review_id)
  .then(comment => {
    res.status(201).send({ comment })
  })
  .catch(next)
}