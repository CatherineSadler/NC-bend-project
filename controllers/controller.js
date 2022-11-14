const { selectCategories } = require('../models/model.js')

exports.getCategories = (req,res,next) => {
    return selectCategories().then(categories => {
        console.log(categories)
        res.status(200).send({categories:categories})
    })

}