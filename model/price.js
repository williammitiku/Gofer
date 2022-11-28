const mongoose = require('mongoose')

const PriceType = {
    RIDE: "ride",
    DELIVERY: "delivery",
    FOOD: "food"
}

const priceSchema = mongoose.Schema({
    type: {
        type: String,
        required: true
    },
    initialPrice: {
        type: Number,
        required: true,
        default: 0
    },
    pricePerKM: {
        type: Number,
        required: true,
        default: 0
    }
})

const Prices = mongoose.model('price', priceSchema)

module.exports = Prices