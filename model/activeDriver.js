const mongoose = require('mongoose')
const location = require('../model/location')

const activeDriverSchema = mongoose.Schema({
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'drivers',
        unique: true
    },
    socketId: {
        type: String,
        default: false
    },
    location:{
        type: location,
    },
    activeTime: {
        type: String
    }
},
{timestamps: true})

const ActiveDrivers = mongoose.model('active_driver', activeDriverSchema)

module.exports = ActiveDrivers