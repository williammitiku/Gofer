const ActiveDrivers = require('../model/activeDriver')
const distance = require('../helper/distance')
const clearCache = require("../services/cache");

const activeDriverController = {

    create: async (driverId, socketId, location) => {
        try {
            // const { driverId, socketId, location }  = req.body;
            
            var existingDriver = await ActiveDrivers.findOne({driverId: driverId});
            if(existingDriver) return;

            var newActiveDriver = await ActiveDrivers.create({
                    driverId: driverId,
                    socketId: socketId, 
                    location: location
                });
            
            clearCache(ActiveDrivers.collection.collectionName);
        } 
        catch (e) {
            console.log(e);
            return  res.status(500).json({status: "error", message: e.message})
        }
    },

    getInfo: async (driverId) => {
        try {
            
            var driver = await ActiveDrivers.findOne({driverId: driverId});
            
            return driver; 
        } 
        catch (e) {
            console.log(e);
            return  res.status(500).json({status: "error", message: e.message})
        }
    },

    updateLocation: async (driverId, location) => {
        try{
          
            // const { driverId, location } = req.body;
            
            const driver = await ActiveDrivers.findOne({driverId: driverId})

            if(!driver) return res.status(200).json({status: "error", message: 'driver not found'})

            const updatedDriver = await ActiveDrivers.findOneAndUpdate(
                {driverId: driverId},
                    {
                        $set: {
                            location,
                        },
                    },
                    {new:true}
            );
            
            await updatedDriver.save();

            clearCache(ActiveDrivers.collection.collectionName);
            
            return updatedDriver
        } 
        catch (e) {
            console.log(e);
            return // res.status(500).json({status: "error", message: e.message})
        } 
    },

    delete: async (driverId) => {
        try {

            const result = await ActiveDrivers.deleteOne({driverId: driverId})

            clearCache(ActiveDrivers.collection.collectionName);

            if (result.deletedCount === 1) {
                return "success - removing driver from active drivers";
            } else {
                return "fail - removing driver from active drivers"; 
            }
        } 
        catch (e) {
            console.log(e);
            return  res.status(500).json({status: "error", message: e.message})
        }
    },
    
    getAll: async (req, res) => {
        try {

            var activeDrivers = await ActiveDrivers.find().cache();
            if(!activeDrivers) return res.status(200).json({status: "error",  message:"no active drivers found"}); 
    
            return res.status(200).json({
                status: "success", 
                message: 'success', 
                activeDrivers: activeDrivers 
            });
        } 
        catch (e) {
            console.log(e);
            return  res.status(500).json({status: "error", message: e.message})
        }
    },
    
    getNearest: async (latitude, longitude ) => {
        try {

            var activeDrivers = await ActiveDrivers.find().cache();
            if(!activeDrivers) return res.status(200).json({status: "error",  message:"no active drivers found"}); 
    
            var nearByDrivers = [];
            
            for (let i = 0; i < activeDrivers.length; i++) {
                var dist = distance.calculate(
                    latitude, longitude, 
                    activeDrivers[i].location.latitude, activeDrivers[i].location.longitude
                    );

                    // if(dist < 10) 
                    nearByDrivers.push(activeDrivers[i]);
                    
                    // console.log(`name ${activeDrivers[i].name} - distance: ${dist}`)
              }

            return nearByDrivers
        } 
        catch (e) {
            console.log(e);
            return []
        }
    },
    
}

module.exports = activeDriverController;
