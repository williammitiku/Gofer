const { Users } = require('../model/user')
const Rides = require('../model/ride')
const { Drivers } = require('../model/driver')
const activeDriverController = require('./activeDriverController')
const socket = require('../services/socket')
const Prices = require('../model/price')
const clearCache = require("../services/cache");

const CancelBy = {
    USER : 'user',
    DRIVER: 'driver'
}

const rideController = {

    getPrice: async (req, res) => {
        const { distance } = req.body;
        
        try {
            var ridePrice = await Prices.findOne({"type": "ride"}).cache();

            var totalPrice = ridePrice.initialPrice + (ridePrice.pricePerKM * distance);

            res.status(200).json({message: "success", totalPrice: totalPrice})
        } catch (e) {
            return  res.status(200).json({status: "error", message: e.message})
        }
    },

    search: async (req, res) => {
        const { origin, destination, distance, totalPrice, userSocketId } = req.body;
        
        try {
            const userData = await Users.findById(req.user.userId);

            const nearByDrivers = await activeDriverController.getNearest(origin.latitude, origin.longitude);
            if (!nearByDrivers) return res.status(200).json({status: "error", message: "nearby driver not found"})

            nearByDrivers.sort(function(a, b) {
                return new Date(b.date) - new Date(a.date);
            })

            var driverData = await Drivers.findById(nearByDrivers[0].driverId);


            var rideInfo = await Rides.create({
                rideCode: generateRideCode(),
                userId: req.user.userId,
                driverId: nearByDrivers[0].driverId,
                userData, 
                driverData, 
                userSocketId, 
                driverSocketId: nearByDrivers[0].socketId,
                origin, 
                destination, 
                distance, 
                location: nearByDrivers[0].location, 
                totalPrice, 
                // nearByDrivers, 
            });

            if(!rideInfo) {
                console.log('saving trip info failed')
                return res.status(200).json({status: "error", message: "driver assigning failed"})
            }

            clearCache(Rides.collection.collectionName);

            //Send to information to the driver
            socket.sendMessage(nearByDrivers[0].socketId, "work-assigned", rideInfo);

            return res.status(200).json({status: "success", message: "driver assigned"})

        } catch (e) {
            return  res.status(200).json({status: "error", message: e.message})
        }
    },

    updateRide: async (rideCode, driverId, driverData, driverSocketId, location, decliningDriverId, cancelReason) => {
        
        try {

            const updatedRide = await Rides.findOneAndUpdate(
                {rideCode: rideCode},
                {
                    $set: {
                        driverId, driverData, driverSocketId, location, status
                    }
                },
                {new:true}
            );
            if(decliningDriverId) {
                await updatedRide.$push( { declinedDrivers: { driverId: decliningDriverId, cancelReason: cancelReason} })
            }
            await updatedRide.save();
            
            clearCache(Rides.collection.collectionName);

            return updatedRide
        } catch (e) {
            console.log(e);
            return
        }
    },

    updateStatus: async (rideCode, status) => {
        
        try {

            const updatedRide = await Rides.findOneAndUpdate(
                {rideCode: rideCode},
                {
                    $set: {
                        status
                    },
                },
                {new:true}
            );

            await updatedRide.save();
            
            clearCache(Rides.collection.collectionName);

            return updatedRide
        } catch (e) {
            console.log(e);
            return
        }
    },

    cancelRide: async (rideCode, reason) => {
        
        try {
            
            const updatedRide = await Rides.findOneAndUpdate(
                {rideCode: rideCode},
                {
                    $set: {
                        canceledBy: CancelBy.USER,
                        cancelReason: reason,
                        status : 'canceled'
                    },
                },
                {new:true}
            );

            await updatedRide.save();
         
            clearCache(Rides.collection.collectionName);

            return updatedRide
        } catch (e) {
            console.log(e);
            return
        }
    },

    trackRide: async (rideCode, location) => {
        
        try {

            const updatedRide = await Rides.findOneAndUpdate(
                {rideCode: rideCode},
                {
                    $push: {
                        path: location
                    },
                },
                {new:true}
            );

            await updatedRide.save();
            
            clearCache(Rides.collection.collectionName);

            return updatedRide
        } catch (e) {
            console.log(e);
            return
        }
    },
}
function generateRideCode() {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var charactersLength = characters.length;
    for ( var i = 0; i < 8; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

module.exports = rideController;
