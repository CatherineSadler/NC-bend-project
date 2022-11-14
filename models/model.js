const db = require("../db/connection.js");


exports.selectCategories = () => {
    return db
    .query(`
    SELECT * from categories
    `)
    .then(category => {
        return category.rows
    })
}