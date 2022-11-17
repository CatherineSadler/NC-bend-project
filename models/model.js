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

exports.selectReviews = (sort_by = "created_at", order = "DESC", category) => {
  const valid_sort_by = [
    "title",
    "category",
    "designer",
    "owner",
    "review_body",
    "review_img_url",
    "created_at",
    "votes",
    "comment_count",
    "review_id",
  ];
  const validOrder = ["ASC", "DESC", "asc", "desc"];
  const values = [];
  if (!valid_sort_by.includes(sort_by)) {
    return Promise.reject({ status: 400, msg: "Invalid sort_by query" });
  } else if (!validOrder.includes(order)) {
    return Promise.reject({ status: 400, msg: "Invalid order query" });
  }

  if (sort_by === "review_id") {
    sort_by = "reviews.review_id";
  }
  if (sort_by === "created_at") {
    sort_by = "reviews.created_at";
  }
  if (sort_by === "votes") {
    sort_by = "reviews.votes";
  }
  if (sort_by === "title") {
    sort_by = "title::bytea";
  }
  if (sort_by === "designer") {
    sort_by = "designer::bytea";
  }
  if (sort_by === "review_body") {
    sort_by = "title::bytea";
  }

  let SQLString = `
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
   ON reviews.review_id = comments.review_id`;

  if (category) {
    SQLString += " WHERE category = $1";
    values.push(category);
  }

  SQLString += ` GROUP BY reviews.review_id ORDER BY ${sort_by} ${order};`;
  return this.selectCategories()
    .then((validCategories) => {
      const categoryNames = validCategories.map((category) => {
        return category.slug;
      });
      categoryNames.push(undefined);
      if (!categoryNames.includes(category)) {
        return Promise.reject({ status: 404, msg: "Category not found" });
      }
    })
    .then(() => {
      return db.query(SQLString, values).then((reviews) => {
        return reviews.rows;
      });
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
   `,
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
    `,
      [votes_increment, review_id]
    )
    .then((review) => {
      if (review.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Review not found" });
      }
      return review.rows[0];
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
