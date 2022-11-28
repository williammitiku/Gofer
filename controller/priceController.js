const Prices = require('../model/price')
//const clearCache = require("../services/cache");

const priceController = {

    add: async(req, res) => {

        try {
            const { type, initialPrice, pricePerKM } = req.body;
            
            const newPrice = await Prices.create({
                type, initialPrice, pricePerKM
            })

            if(!newPrice) return res.status(200).json({status: "error",  message:"adding price failed" }); 
            
           // clearCache(Prices.collection.collectionName);

            return res.status(200).json({
                status: "success", 
                message: `price added succcessfully`, 
            });

        }
        catch (e) {
            console.log(e);
            return res.status(500).json({ status: "error", message: e.message })
        }
    },

    get: async(req, res) => {

        try {
            
            //const prices = await Prices.find().cache()
            const prices = await Prices.find()

            if(!prices) return res.status(200).json({status: "error",  message:"no price data found" }); 
            
            return res.status(200).json({
                status: "success", 
                message: "success", 
                prices
            });

        }
        catch (e) {
            console.log(e);
            return res.status(500).json({ status: "error", message: e.message })
        }
    },

    update: async (req, res) => {

        try {
            const { type, initialPrice, pricePerKM } = req.body;
            
            const updatedPrice = await Prices.findOneAndUpdate(
                { type: type },
                    {
                        $set: {
                            initialPrice, 
                            pricePerKM
                        },
                    },
                    {new:true}
            );
            
            if(updatedPrice) {
               // clearCache(Prices.collection.collectionName);

                res.status(200).json({status: "success", message: "price updated" });
            }
            else return res.status(200).json({status: "error", message: "price update failed"});

        }
        catch (e) {
            console.log(e);
            return res.status(500).json({ status: "error", message: e.message })
        }
    },

}

module.exports = priceController