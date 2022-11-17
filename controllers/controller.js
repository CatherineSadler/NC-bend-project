const {
  selectCategories,
  selectReviews,
  selectReviewsById,
  selectCommentsByReviewId,
  updateReviewVotes,
  insertIntoCommentsByReviewId,
  selectUsers,
} = require("../models/model.js");

const { checkCategory } = require("../db/seeds/utils.js");

exports.getCategories = (req, res, next) => {
  return selectCategories()
    .then((categories) => {
      res.status(200).send({ categories: categories });
    })
    .catch(next);
};

exports.getReviews = (req, res, next) => {
  const category = req.query.category;
  const sort_by = req.query.sort_by;
  const order = req.query.order;

  return selectReviews(sort_by, order, category)
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
  return selectReviewsById(req.params.review_id)
    .then(() => {
      return selectCommentsByReviewId(req.params.review_id);
    })
    .then((comments) => {
      res.send({ comments });
    })
    .catch(next);
};

exports.patchReviewVotesById = (req, res, next) => {
  const review_id = req.params.review_id;
  const vote_increment = req.body.inc_votes;
  return updateReviewVotes(review_id, vote_increment)
    .then((review) => {
      res.send({ review });
    })
    .catch(next);
};

exports.postCommentsByReviewId = (req,res,next) => {
  const body = req.body.body;
  const username = req.body.username;
  const review_id = req.params.review_id;
  return insertIntoCommentsByReviewId(body, username, review_id)
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch(next);
};

exports.getUsers = (req, res, next) => {
  return selectUsers().then((users) => {
    res.send({ users });
  });
};
