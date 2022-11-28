const mongoose = require('mongoose')
const location = require('../model/location')

const restaurant = {
    restaurantName: {
        type: String,
        unique: true,
        required: true,
    },
    yearStarted: {
        type: Number,
        required: true,
    },
    location: {
        type: location
    },
    ownerFullName: {
        type: String,
        required: true,
    },
    ownerPhoneNumber: {
        type: String,
        required: true,
    },
    workingHours: {
        type: String,
        required: true,
    },
    speciality: {
        type: String,
        required: false,
    },
    email: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: false,
    },
    isDisabled: {
        type: Boolean,
        default: false
    },
    restId:{
        type: String,
    }
    //RESID78900        
    
}
const restaurantSchema = mongoose.Schema(restaurant)

const Restaurants = mongoose.model('restaurant', restaurantSchema)

module.exports = { Restaurants, restaurant }