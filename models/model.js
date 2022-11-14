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
