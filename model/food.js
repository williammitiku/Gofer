const mongoose = require('mongoose')

const food = {
    foodName: {
        type: String,
        required: true,
    },
    foodCategory: {
        type: String,
        required: true,
    },
    foodPrice: {
        type: String,
        required: true,
    },
    foodRecipe:{
        type: String,
        required: true,
    },

    additionalInformation: {
        type: String,
        required: false,
    },
    image: {
        type: String,
        required: true,
    },
    isDisabled: {
        type: Boolean,
        default: false
    },
    restId:{
        type: String,
        required: true,
    },
    foodId:{
        type: String,
    }
}
const foodSchema = mongoose.Schema(food)
const Foods = mongoose.model('food', foodSchema)

module.exports = { Foods, food }