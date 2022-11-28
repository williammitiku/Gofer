const {Server} = require('socket.io')//(3000)
const activeDriverController = require('../controller/activeDriverController')
const rideController = require('../controller/rideController')
let io;

const socket = {
    init: (httpServer) => {
        io = new Server(httpServer);

        io.on(
            "connection", (socket) => {
              console.log(`socket created: ${socket.id}`)
          
              socket.on("location", (data) => {
                io.emit("location",data);
          
                console.log(data);
              })
          
              //driver app started
              socket.on("driver-app-started", async (data) => {
          
                //put driver on activeDrivers db
                const { driverId, socketId, location } = JSON.parse(data);
                await activeDriverController.create(driverId, socketId, location);
                
                console.log(`driver-app-started ${data}`);
              })
          
              //driver app stop
              socket.on("driver-app-stop", async (data) => {
          
                //remove driver from activeDrivers db
                const { driverId } = JSON.parse(data);
                await activeDriverController.delete(driverId);
                
                console.log(`driver-app-stop ${data}`);
              })
          
              //driver location changed
              socket.on("driver-location-changed", async (data) => {
          
                //update driver location on activeDrivers db
                const { driverId, location } = JSON.parse(data);
                await activeDriverController.updateLocation(driverId, location);
          
                console.log(`driver-location-changed ${data}`);
              })
          
              //user location
              socket.on("user-location", async (data) => {
                // const { latitude, longitude, socketId } = JSON.parse(data);
                //return list of nearby drivers
          
                if(!data.socketId) return
          
                const nearByDrivers = await activeDriverController.getNearest(data.latitude, data.longitude);
                io.to(data.socketId).emit("nearby-drivers", JSON.stringify(nearByDrivers)); 
          
                console.log(`user-location ${data}`);
              })
          
              //driver accept work
              socket.on("accept-job", async (data) => {   
                const { rideInfo } = JSON.parse(data);
                io.to(rideInfo.userSocketId).emit("driver-assigned", rideInfo);
                
                rideController.updateStatus("driverAssigned")
                activeDriverController.delete(driverId);
                
                console.log(`accept-job ${data}`);
              })
              
              //driver decline work
              socket.on("decline-job", async (data) => {   
                const { rideInfo, cancelReason } = JSON.parse(data);
          
                const nearByDrivers = await activeDriverController.getNearest(latitude, longitude);
                
                //Remove currently declining driver from the list
                const index = nearByDrivers.indexOf({'driverId': rideInfo.driverId});
                if (index > -1) { // only splice array when item is found
                  nearByDrivers.splice(index, 1); 
                }
                //Remove previously declining driver from the list
                if(rideInfo.declinedDrivers && rideInfo.declinedDrivers.length > 0) {
                  for (var i = 0; i < rideInfo.declinedDrivers.length; i++) {
                    
                    var indexOfItem = nearByDrivers.indexOf({'driverId': rideInfo.declinedDrivers[i].driverId});
                    if (indexOfItem > -1) { // only splice array when item is found
                      nearByDrivers.splice(indexOfItem, 1); 
                    }
                  }
                }
          
                if(nearByDrivers.length == 0) {
                  io.to(rideInfo.userSocketId).emit("driver-not-found", rideInfo);
                  return;
                }
                
                var driverData = await Drivers.findById(nearByDrivers[0].driverId);
                
                var updatedRide = rideController.updateRide(
                  rideInfo.rideCode, 
                  nearByDrivers[0].driverId, 
                  driverData, 
                  nearByDrivers[0].socketId, 
                  nearByDrivers[0].location, 
                  rideInfo.driverId, 
                  cancelReason
                )
                
                io.to(nearByDrivers[0].socketId).emit("work-assigned", updatedRide);
          
                console.log(`decline-job ${data}`);
              })
          
              //driver start ride
              socket.on("start-ride", async (data) => {   
                const { rideInfo, location } = JSON.parse(data);
          
                var updatedRide = await rideController.updateStatus(rideInfo.rideCode, "started")
                
                io.to(rideInfo.userSocketId).emit("ride-started", rideInfo);
          
                await rideController.trackRide(rideInfo.rideCode, location)
                
                console.log(`start-ride ${data}`);
              })
          
              //driver end ride
              socket.on("end-ride", async (data) => {   
                const { rideInfo } = JSON.parse(data);
          
                var updatedRide = await rideController.updateStatus(rideInfo.rideCode, "completed")
                
                io.to(rideInfo.userSocketId).emit("ride-completed", rideInfo);
          
                console.log(`end-ride ${data}`);
              })
          
              //user cancel ride 
              socket.on("cancel-ride", async (data) => {
                const { rideInfo, reason } = JSON.parse(data);
                
                //cancel ride and save status
                var updatedRide = await rideController.cancelRide(rideInfo.rideCode, reason)
                
                io.to(rideInfo.driverSocketId).emit("ride-canceled", rideInfo);
          
                console.log(`cancel-ride ${data}`);
              })
              
              //trip location tracking
              socket.on("ride-location-tracking", async (data) => {
                //send location for user
          
                const { clientSocketId, rideCode, location } = JSON.parse(data);
          
                socket.to(clientSocketId).emit("ride-tracking", location)
                await rideController.trackRide(rideCode, location)
          
                console.log(`ride-tracking ${data}`);
              })
          
              socket.on("disconnect", (data) => {
                // console.log(data);
              })
            })
    },

    sendMessage: (socketId, key, message) => {
        io.to(socketId).emit(key, message);
    }
}

module.exports = socket