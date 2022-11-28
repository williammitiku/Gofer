var mongoose = require('mongoose')
const location = require("../model/location")
const { User } = require("../model/user")
const { Driver } = require("../model/driver")

const RideStatus = {
    REQUESTED : 'requested',
    DRIVER_ASSIGNED: 'driverAssigned',
    STARTED: 'started',
    ON_THE_WAY: 'onTheWay',
    COMPLETED: 'completed',
    CANCELED: 'canceled',
}

const rideSchema = {
    rideCode: {
        type: String,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'users',
    },
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'drivers',
    },
    userData: {
        type: User,
    },
    driverData: {
        type: Driver,
    },
    userSocketId: {
        type: String,
        // required: true
    },
    driverSocketId: {
        type: String,
        // required: true
    },
    origin: {
        type: location,
        required: true
    },
    destination: {
        type: location,
        required: true
    },
    distance: {
        type: Number,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    },
    location: {
        type: location,
    },
    path: [
        location
    ],
    declinedDrivers: [
        {
            driverId: {
                type: String,
            },
            cancelReason: {
                type: String,
            },
        }
    ],
    status: {
        type: String,
        default: RideStatus.REQUESTED
    },
    canceledBy: {
        type: String,
    },
    cancelReason: {
        type: String,
    },
}

const Rides = mongoose.model("ride", rideSchema);

module.exports = Rides