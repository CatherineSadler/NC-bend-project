const db = require("../db/connection.js");

exports.selectCategories = () => {
  return db
    .query(
      `
    SELECT * from categories
    `
    )
    .then((category) => {
      return category.rows;
    });
};

exports.selectReviews = () => {
  return db
    .query(
      `
    SELECT 
        reviews.review_id, 
        title, 
        category, 
        designer, 
        owner,
        review_img_url, 
        reviews.created_at, 
        reviews.votes,
        COUNT(comments.comment_id)::INT AS comment_count
     FROM reviews
     LEFT JOIN comments
     ON reviews.review_id = comments.review_id
     GROUP BY reviews.review_id
     ORDER BY reviews.created_at DESC;`
    )
    .then((reviews) => {
      return reviews.rows;
    });
};

exports.selectReviewsById = (review_id) => {
  return db
    .query(
      `
    SELECT * FROM reviews
    WHERE review_id = $1;`,
      [review_id]
    )
    .then((review) => {
      if (review.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Review not found" });
      }
      return review.rows[0];
    });
};

exports.selectCommentsByReviewId = (review_id) => {
  return db
    .query(
      `SELECT * FROM comments
        WHERE review_id = $1
        ORDER BY created_at DESC`,
      [review_id]
    )
    .then((comments) => {
      return comments.rows;
    });
};

exports.updateReviewVotes = (review_id, votes_increment) => {
  return db
  .query(
    `UPDATE 
      reviews
    SET
      votes = votes + $1
    WHERE
      review_id = $2
    RETURNING *;
    `
  , [votes_increment, review_id])
  .then((review) => {
    if (review.rows.length === 0) {
      return Promise.reject({ status: 404, msg: "Review not found" });
    }
    return review.rows[0]
  })
}

