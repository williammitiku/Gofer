const { Restaurants } = require('../model/restaurant')
//const clearCache = require("../services/cache");

const restaurantController = {
    
    register: async (req, res) => {
        try {
            const restaurant = req.body;

            // var existingHotel = await Hotels.find({email: hotel.email}, {name: hotel.name})
            // if(existingHotel) return res.status(200).json({status: "error", message: "Hotel already registered"})
            // stringToImages([hotel.logoImage, hotel.businessLicenseImage], async (error, imageUrls) => {
                try {
                    // if (error) {
                    //     return res.status(200).json({status: "error", message: "error occured while saving images", error: error });
                    // }
                    // if (!imageUrls) {
                    //     return res.status(200).json({status: "error", message: "unable to save images" });
                    // }
                    // hotel.logoImage = "logoImage"//imageUrls[0];
                    // hotel.businessLicenseImage = "businessLicenseImage"//imageUrls[1];
    
                    restaurant.restId = generateRestaurantId(restaurant.name);
                    var newRestaurant = await Restaurants.create(restaurant);

                    if(!newRestaurant) return res.status(200).json({status: "error", message: "Restaurant registration failed" });

                    //clearCache(Restaurants.collection.collectionName);

                    return res.status(200).json({status: "success", message: "Restaurant registered", restaurant: newRestaurant });
                }
                catch(error) {
                    return res.status(200).json({status: "error", message:"error", error: error});
                }

            // });            
            
        } catch (e) {
            console.log(e);
            return  res.status(200).json({status: "error", message: e.message})
        }
    },

    create: async (req, res) => {
        try {
            const  restaurant  = req.body;
            var rest2 = generateRestaurantId('REST');
            console.log(rest2);
            restaurant.restId=rest2;


            var newRestaurant = await Restaurants.create(restaurant);
            if(!newRestaurant) return res.status(200).json({status: "error",  message:"Restaurant  creating failed"}); 
    
            //clearCache(Restaurants.collection.collectionName);

            return res.status(200).json({
                status: "success", 
                message: 'New Restaurant Information created successfully', 
                restaurant: restaurant 
            });
        } 
        catch (e) {
            console.log(e);
            return  res.status(500).json({status: "error", message: e.message})
        }
    },

    getAll: async (req, res) => {
        try {

           // var restaurants = await Restaurants.find().cache();
           var restaurants = await Restaurants.find();
            if(!restaurants) return res.status(200).json({status: "error",  message:"no Restaurant found"}); 
    
            return res.status(200).json({
                status: "success", 
                message: 'success', 
                restaurants: restaurants 
            });
        } 
        catch (e) {
            console.log(e);
            return  res.status(500).json({status: "error", message: e.message})
        }
    },
    getAllRestaurants: async (req, res) => {
        try {

            var restaurants = await Restaurants.find();
            if(!restaurants) return res.status(200).json({status: "error",  message:"no Restaurant found"}); 
    
            return res.status(200).json({
                status: "success", 
                message: 'success', 
                restaurants: restaurants 
            });
        } 
        catch (e) {
            console.log(e);
            return  res.status(500).json({status: "error", message: e.message})
        }
    },
    delete: async (req, res) => {
        try {
            const {restId}  = req.body;

            //var restaurant = await Restaurants.find({restId: restId}).cache();
            var restaurant = await Restaurants.find({restId: restId})
            if(!restaurant) return res.status(200).json({status: "error",  message:"delivery time not found"}); 
    
            //clearCache(Restaurants.collection.collectionName);
            
            const result = await Restaurants.deleteOne({restId: restId})
            if (result.deletedCount === 1) {
                return res.status(200).json({status: "success", message:"Restaurant Information deleted" });
            } else {
                return res.status(200).json({status: "error",  message:"deleting Restaurant Information failed" }); 
            }
        } 
        catch (e) {
            console.log(e);
            return  res.status(500).json({status: "error", message: e.message})
        }
    },

    update: async (req, res) => {
        try{
            const {
                restId,
                restaurantName,
                yearStarted,
                ownerFullName,
                email,
                ownerPhoneNumber,
                location,
                isDisabled
            } = req.body;
            
            const restaurant = await Restaurants.findOne({restId: restId})

            if(!restaurant) return res.status(200).json({status: "error", message: 'Restaurant Information not found'})

           // clearCache(Restaurants.collection.collectionName);
            
            const newRestaurant = await Restaurants.findOneAndUpdate(
                {restId: restId},
                    {
                        $set: {
                            restaurantName,
                            yearStarted,
                            ownerFullName,
                            email,
                            ownerPhoneNumber,
                            isDisabled,
                            location
                        },
                    },
                    {new:true}
            );
            
            await newRestaurant.save();

            if(newRestaurant) return res.status(200).json({status: "error", message: "Restaurant Information updated successfully", restaurant: newRestaurant});
            else return res.status(200).json({status: "error", message: "Restaurant Information update failed"});
        } 
        catch (e) {
            console.log(e);
            return  res.status(500).json({status: "error", message: e.message})
        } 
    },

    getNearyBy: async (req, res) => {
        try {
            const { currentLocation } = req.body;
            var restaurants = await Restaurants.find({},{'image':0});
            if(!restaurants) return res.status(200).json({status: "error",  message:"no Restaurant found"}); 
    
            var nearByRestaurants = [];
            
            for (let i = 0; i < restaurants.length; i++) {
                var dist = distance(
                        currentLocation.latitude, currentLocation.longitude, 
                        restaurants[i].location.latitude, restaurants[i].location.longitude
                    );

                    if(dist < 10) nearByRestaurants.push(restaurants[i]);
                    
                    console.log(`name ${restaurants[i].name} - distance: ${dist}`)
              }

            return res.status(200).json({
                status: "success", 
                message: 'success', 
                restaurants: nearByRestaurants 
            });
        } 
        catch (e) {
            console.log(e);
            return  res.status(500).json({status: "error", message: e.message})
        }
    },
    
}

function generateRestaurantId (name) {
    var result           = '';
    var characters       = '0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < 3; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return name.trim().substring(0,4).toUpperCase() + parseInt(Math.random() * (999 - 100) + 100).toString()+ result.toUpperCase();
};

function distance(lat1,lon1,lat2, lon2)
{

    // The math module contains a function
    // named toRadians which converts from
    // degrees to radians.
    lon1 =  lon1 * Math.PI / 180;
    lon2 = lon2 * Math.PI / 180;
    lat1 = lat1 * Math.PI / 180;
    lat2 = lat2 * Math.PI / 180;

    // Haversine formula
    let dlon = lon2 - lon1;
    let dlat = lat2 - lat1;
    let a = Math.pow(Math.sin(dlat / 2), 2)
    + Math.cos(lat1) * Math.cos(lat2)
    * Math.pow(Math.sin(dlon / 2),2);

    let c = 2 * Math.asin(Math.sqrt(a));

    // Radius of earth in kilometers. Use 3956
    // for miles
    let r = 6371;

    // calculate the result
    return(c * r);
}

module.exports = restaurantController