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
      .get("/api/reviews/1")
      .expect(200)
      .then((res) => {
        expect(res.body.review).toMatchObject({
          review_id: 1,
          title: expect.any(String),
          review_body: expect.any(String),
          designer: expect.any(String),
          review_img_url: expect.any(String),
          votes: expect.any(Number),
          category: expect.any(String),
          owner: expect.any(String),
          created_at: expect.any(String),
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
});

describe("/api/reviews/:review_id/comments", () => {
  test("GET 200 - returns array of comment objects for associated review_id, sorted with newest first", () => {
    return request(app)
      .get("/api/reviews/1/comments")
      .then((res) => {
        expect(Array.isArray(res.body.comments)).toBe(true)
        res.body.comments.forEach((comment) => {
          expect(comment).toMatchObject({
            comment_id: expect.any(Number),
            votes: expect.any(Number),
            created_at: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            review_id: 1,
          });
        });
        expect(res.body.comments).toBeSortedBy("created_at", { descending: true });
      });
  });
  test('GET 404 - errors for review id out of bounds', () => {
    return request(app)
    .get("/api/reviews/1000/comments")
    .expect(404)
    .then(res => {
        expect(res.body.msg).toBe('Review not found')
    })
  });
  test('GET 400 - errors for review_id not of type integer', () => {
    return request(app)
    .get("/api/reviews/badString/comments")
    .then(res => {
        expect(res.body.msg).toBe('Invalid data type')
    })
  });
});
