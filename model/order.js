const mongoose = require('mongoose')
const location = require('./location')
const { User } = require('./user')
const { Biker } = require('./biker')
const { food } = require('../model/food')
const { restaurant } = require('../model/restaurant')
const OrderStatus = {
    REQUESTED : "requested", 
    CONFIRMED : "confirmed", 
    DRIVER_ASSIGNED : "driver_assigned", 
    ON_THE_WAY : "on_the_way", 
    DELIVERED : "delivered",
    PAYMENT_RECEIVED : "payemnt_received"
}

const PaymentType = {
    CASH : 1, 
    CARD : 2
}
const orderSchema = mongoose.Schema({
    orderId: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    userInfo: {
        type: User
    },
    bikerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'bikers',
      //  required: true
    },
    bikerInfo: {
        type: Biker
    },
    foodInfo:{
       type:food,
    },
    restId:{
        type:String
    },
    restaurantInfo: {
        type: restaurant
    },
    orders: [
        {
            foodId: {
                type: String,
                required: true
            },
            quantity: {
                type: Number,
                required: true
            }
        }
    ],
    userLocation: {
        type: location,
        required: true
    },
    path: [
        {
            latitude: {
                type: Number,
                required: true
            },
            longitude: {
                type: Number,
                required: true
            }
        }
    ],
    paymentType: {
        type: String,
    },
    foodPrice: {
        type: Number,
    },
    deliveryPrice: {
        type: Number,
    },
    totalPrice: {
        type: Number,
    },
    status: {
        type: String,
        default: OrderStatus.REQUESTED
    },
},{timestamps: true})

const Orders = mongoose.model('order', orderSchema)

module.exports = { Orders, OrderStatus, PaymentType }