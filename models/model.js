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
      SELECT 
      reviews.review_id, 
      title, 
      category, 
      designer, 
      owner,
      review_img_url, 
      reviews.created_at, 
      reviews.votes,
      review_body,
      COUNT(comments.comment_id)::INT AS comment_count
   FROM reviews
   LEFT JOIN comments
   ON reviews.review_id = comments.review_id
   WHERE reviews.review_id = $1
   GROUP BY reviews.review_id;
   `
    ,
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

exports.insertIntoCommentsByReviewId = (body, username, review_id) => {
  return db
    .query(
      `
  INSERT INTO 
    comments  (body, author, review_id)
  VALUES
    ($1, $2, $3) 
  RETURNING *`,
      [body, username, review_id]
    )
    .then((comment) => {
      return comment.rows[0];
    });
};

exports.selectUsers = () => {
  return db
  .query(
    `SELECT username, name, avatar_url FROM users`
  )
  .then(users => {
    return users.rows
  })
}

exports.removeComment = (comment_id) => {
  return db 
  .query(`
  DELETE FROM comments
  WHERE comment_id = $1
  RETURNING *;
  `, [comment_id])
  .then(comment => {
    if (comment.rows.length === 0) {
      return Promise.reject({status: 404, msg: 'Comment not found'})
    }
  })
}
