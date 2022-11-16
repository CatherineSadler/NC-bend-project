const db = require("../db/connection.js");
const seed = require("../db/seeds/seed.js");
const request = require("supertest");
const app = require("../app.js");
const testData = require("../db/data/test-data/index.js");

beforeEach(() => seed(testData));

afterAll(() => db.end());

describe("/api/categories", () => {
  test("GET -200: responds with an array of category objects with slug and description properties", () => {
    return request(app)
      .get("/api/categories")
      .expect(200)
      .then((res) => {
        expect(res.body.categories.length).toBe(4);
        res.body.categories.forEach((category) => {
          expect(typeof category).toBe("object");
          expect(category).toMatchObject({
            slug: expect.any(String),
            description: expect.any(String),
          });
        });
      });
  });
});

describe("/api/reviews", () => {
  test("GET 200 - responds with array of objects, each containing relevant fields", () => {
    return request(app)
      .get("/api/reviews")
      .expect(200)
      .then((res) => {
        const reviews = res.body.reviews;
        expect(reviews.length).toBe(13);
        reviews.forEach((element) => {
          expect(element).toMatchObject({
            owner: expect.any(String),
            title: expect.any(String),
            review_id: expect.any(Number),
            category: expect.any(String),
            review_img_url: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            designer: expect.any(String),
            comment_count: expect.any(Number),
          });
        });
        expect(reviews).toBeSortedBy("created_at", { descending: true });
      });
  });
});

describe("/api/reviews/:review_id", () => {
  test("GET 200 - returns object associated with id", () => {
    return request(app)
      .get("/api/reviews/2")
      .expect(200)
      .then((res) => {
        expect(res.body.review).toMatchObject({
          review_id: 2,
          title: expect.any(String),
          review_body: expect.any(String),
          designer: expect.any(String),
          review_img_url: expect.any(String),
          votes: expect.any(Number),
          category: expect.any(String),
          owner: expect.any(String),
          created_at: expect.any(String),
          review_body: expect.any(String),
        });
      });
  });
  test("GET 404 - errors for review_id out of bounds", () => {
    return request(app)
      .get("/api/reviews/1000")
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("Review not found");
      });
  });
  test("PATCH 200 - returns updated review object", () => {
    const vote_inc = { inc_votes: 5 };
    return request(app)
      .patch("/api/reviews/1")
      .send(vote_inc)
      .expect(200)
      .then((res) => {
        expect(res.body.review).toMatchObject({
          review_id: 1,
          title: expect.any(String),
          review_body: expect.any(String),
          designer: expect.any(String),
          review_img_url: expect.any(String),
          votes: 6,
          category: expect.any(String),
          owner: expect.any(String),
          created_at: expect.any(String),
        });
      });
  });
  test("PATCH 400 if incomplete keys", () => {
    const vote_increment = { test: "test" };
    return request(app)
      .patch("/api/reviews/1")
      .send(vote_increment.test)
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Incomplete object on body");
      });
  });
  test("PATCH 404 - errors if review not found", () => {
    const vote_inc = { inc_votes: 5 };
    return request(app)
      .patch("/api/reviews/1000")
      .send(vote_inc)
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("Review not found");
      });
  });
  test("PATCH 400- errors if invalid data type", () => {
    const vote_inc = { inc_votes: "badString" };
    return request(app)
      .patch("/api/reviews/1")
      .send(vote_inc)
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Invalid data type");
      });
  });
});

describe("/api/reviews/:review_id/comments", () => {
  test("GET 200 - returns array of comment objects for associated review_id, sorted with newest first", () => {
    return request(app)
      .get("/api/reviews/2/comments")
      .then((res) => {
        expect(Array.isArray(res.body.comments)).toBe(true);
        res.body.comments.forEach((comment) => {
          expect(comment).toMatchObject({
            comment_id: expect.any(Number),
            votes: expect.any(Number),
            created_at: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            review_id: 2,
          });
        });
        expect(res.body.comments).toBeSortedBy("created_at", {
          descending: true,
        });
      });
  });
  test("GET 404 - errors for review id out of bounds", () => {
    return request(app)
      .get("/api/reviews/1000/comments")
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("Review not found");
      });
  });
  test("GET 400 - errors for review_id not of type integer", () => {
    return request(app)
      .get("/api/reviews/badString/comments")
      .then((res) => {
        expect(res.body.msg).toBe("Invalid data type");
      });
  });
  test("POST 201 - returns posted comment", () => {
    const newComment = {
      body: "this is a test comment",
      username: "mallionaire",
    };
    return request(app)
      .post("/api/reviews/1/comments")
      .send(newComment)
      .expect(201)
      .then((res) => {
        expect(res.body.comment).toMatchObject({
          body: "this is a test comment",
          author: "mallionaire",
          review_id: 1,
          comment_id: expect.any(Number),
          votes: 0,
          created_at: expect.any(String),
        });
      });
  });
  test("POST 404 review not found", () => {
    const newComment = {
      body: "this is a test comment",
      username: "mallionaire",
    };
    return request(app)
      .post("/api/reviews/1000/comments")
      .send(newComment)
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("Review 1000 not found");
      });
  });
  test("POST 400 - bad request if object doesnt have all required keys", () => {
    const newCommentNoBody = {
      username: "mallionaire",
    };
    return request(app)
      .post("/api/reviews/1/comments")
      .send(newCommentNoBody)
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Incomplete object on body");
      });
  });
  test("POST 400 - bad request if object doesnt have all required keys", () => {
    const newCommentNoUsername = {
      body: "this is a test comment",
    };
    return request(app)
      .post("/api/reviews/1/comments")
      .send(newCommentNoUsername)
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Incomplete object on body");
      });
  });
  test("POST 400 - errors for review_id not of type integer", () => {
    const newComment = {
      body: "this is a test comment",
      username: "mallionaire",
    };
    return request(app)
      .post("/api/reviews/badString/comments")
      .send(newComment)
      .then((res) => {
        expect(res.body.msg).toBe("Invalid data type");
      });
  });
});

describe("/api/users", () => {
  test("GET 200 - responds with array of users", () => {
    return request(app)
      .get("/api/users")
      .then((res) => {
        const users = res.body.users;
        expect(users.length).toBe(4);
        users.forEach((user) => {
          expect(user).toMatchObject({
            username: expect.any(String),
            name: expect.any(String),
            avatar_url: expect.any(String),
          });
        });
      });
  });
});

describe("/api/reviews?sort_by=title", () => {
  test("GET 200 - responds with array of reviews sorted by title and descending (defaulted)", () => {
    return request(app)
      .get("/api/reviews?sort_by=title")
      .expect(200)
      .then((res) => {
        const reviews = res.body.reviews;
        expect(reviews.length).toBe(13);
        reviews.forEach((element) => {
          expect(element).toMatchObject({
            owner: expect.any(String),
            title: expect.any(String),
            review_id: expect.any(Number),
            category: expect.any(String),
            review_img_url: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            designer: expect.any(String),
            comment_count: expect.any(Number),
          });
        });
        expect(reviews).toBeSortedBy("title", { descending: true });
      });
  });
  test("GET 200 - responds with array of reviews sorted by comment count and descending (defaulted)", () => {
    return request(app)
      .get("/api/reviews?sort_by=comment_count")
      .expect(200)
      .then((res) => {
        const reviews = res.body.reviews;
        expect(reviews.length).toBe(13);
        reviews.forEach((element) => {
          expect(element).toMatchObject({
            owner: expect.any(String),
            title: expect.any(String),
            review_id: expect.any(Number),
            category: expect.any(String),
            review_img_url: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            designer: expect.any(String),
            comment_count: expect.any(Number),
          });
        });
        expect(reviews).toBeSortedBy("comment_count", { descending: true });
      });
  });
  test("GET 200 - responds with array of reviews sorted by comment count ascending", () => {
    return request(app)
      .get("/api/reviews?sort_by=comment_count&order=asc")
      .expect(200)
      .then((res) => {
        const reviews = res.body.reviews;
        expect(reviews.length).toBe(13);
        reviews.forEach((element) => {
          expect(element).toMatchObject({
            owner: expect.any(String),
            title: expect.any(String),
            review_id: expect.any(Number),
            category: expect.any(String),
            review_img_url: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            designer: expect.any(String),
            comment_count: expect.any(Number),
          });
        });
        expect(reviews).toBeSortedBy("comment_count", { descending: false });
      });
  });
  test("GET 200 - responds with array of reviews sorted by designer ascending (defaulted)", () => {
    return request(app)
      .get("/api/reviews?sort_by=designer&order=asc")
      .expect(200)
      .then((res) => {
        const reviews = res.body.reviews;
        expect(reviews.length).toBe(13);
        reviews.forEach((element) => {
          expect(element).toMatchObject({
            owner: expect.any(String),
            title: expect.any(String),
            review_id: expect.any(Number),
            category: expect.any(String),
            review_img_url: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            designer: expect.any(String),
            comment_count: expect.any(Number),
          });
        });
        expect(reviews).toBeSortedBy("designer", { descending: false });
      });
  });
  test("GET 200 - responds with array of reviews filtered by category social deduction in ascending date order", () => {
    return request(app)
      .get("/api/reviews?category=social deduction&order=asc")
      .expect(200)
      .then((res) => {
        const reviews = res.body.reviews;
        expect(reviews.length > 0).toBe(true);
        reviews.forEach((element) => {
          expect(element).toMatchObject({
            owner: expect.any(String),
            title: expect.any(String),
            review_id: expect.any(Number),
            category: "social deduction",
            review_img_url: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            designer: expect.any(String),
            comment_count: expect.any(Number),
          });
          expect(reviews).toBeSortedBy("created_at", { descending: false });
        });
      });
  });
  test("GET 400 - bad order query", () => {
    return request(app)
      .get("/api/reviews?order=badString")
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Invalid order query");
      });
  });
  test("GET 400 - bad order query", () => {
    return request(app)
      .get("/api/reviews?sort_by=badString")
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Invalid sort_by query");
      });
  });
});
