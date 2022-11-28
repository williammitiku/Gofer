const {Foods} = require('../model/food')

const foodController = {
    
    create: async (req, res) => {

        try {
            const food  = req.body;
            var food2 = generateFoodId('Food');
            console.log(food2);
            food.foodId=food2;
            var newFood = await Foods.create(food);
            if(!newFood) return res.status(200).json({status: "error",  message:"Food  creating failed"}); 
    
            return res.status(200).json({
                status: "success", 
                message: 'Food Information created successfully', 
                food: food 
            });
        } 
        catch (e) {
            console.log(e);
            return  res.status(500).json({status: "error", message: e.message})
        }
    },

    getAll: async (req, res) => {
        try {
         
            var foods = await Foods.find();
            if(!foods) return res.status(200).json({status: "error",  message:"no Food found"}); 
    
            return res.status(200).json({
                status: "success", 
                message: 'success', 
                foods: foods 
            });
        } 
        catch (e) {
            console.log(e);
            return  res.status(500).json({status: "error", message: e.message})
        }
    },

    getAllCategory: async (req, res) => {
        try {
         
            var foods = await Foods.find({}, {"foodCategory":1});
            if(!foods) return res.status(200).json({status: "error",  message:"no Food found"}); 
    
            return res.status(200).json({
                status: "success", 
                message: 'success', 
                foods: foods, 
            });
        } 
        catch (e) {
            console.log(e);
            return  res.status(500).json({status: "error", message: e.message})
        }
    },
    getFoodByRestaurant: async (req, res) => {
        try {
            const fooda = req.body;
      
            var foods = await Foods.find({restId: fooda.restId});
            if(!foods) return res.status(200).json({status: "error",  message:"no Food found"}); 
    
            return res.status(200).json({
                status: "success", 
                message: 'success', 
                foods: foods 
            });
        } 
        catch (e) {
            console.log(e);
            return  res.status(500).json({status: "error", message: e.message})
        }
    },

    getFoodByCategory: async (req, res) => {
        try {
            const foodc = req.body;
            var foods = await Foods.find({foodCategory: foodc.foodCategory});
            if(!foods) return res.status(200).json({status: "error",  message:"no Food found"}); 
    
            return res.status(200).json({
                status: "success", 
                message: 'success', 
                foods: foods 
            });
        } 
        catch (e) {
            console.log(e);
            return  res.status(500).json({status: "error", message: e.message})
        }
    },


   update: async (req, res) => {
        try{
          
            const { 
                foodId,
                foodName,
                foodCategory,
                foodPrice,
                additionalInformation,
                isDisabled
            } = req.body;
            
            const food = await Foods.findOne({foodId: foodId})

            if(!food) return res.status(200).json({status: "error", message: 'Food not found'})

            const newFood = await Foods.findOneAndUpdate(
                {foodId: foodId},
                    {
                        $set: {
                            foodName,
                            foodCategory,
                            foodPrice,
                            additionalInformation,
                            isDisabled
                        },
                    },
                    {new:true}
            );
            
            await newFood.save();

            if(newFood) return res.status(200).json({status: "error", message: "Food Information updated successfully", food: newFood});
            else return res.status(200).json({status: "error", message: "Food Information update failed"});
        } 
        catch (e) {
            console.log(e);
            return  res.status(500).json({status: "error", message: e.message})
        } 
    },
    
    delete: async (req, res) => {
        try {
            const { foodId } = req.body;

            var food = await Foods.find({foodId: foodId});
            if(!food) return res.status(200).json({status: "error",  message:"Food not found"}); 
    
            const result = await Foods.deleteOne({foodId: foodId})
            if (result.deletedCount === 1) {
                return res.status(200).json({status: "success", message:"Food Information deleted" });
            } else {
                return res.status(200).json({status: "error",  message:"deleting Food Information failed" }); 
            }
        } 
        catch (e) {
            console.log(e);
            return  res.status(500).json({status: "error", message: e.message})
        }
    }

}

function generateFoodId (name) {
    var result           = '';
    var characters       = '0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < 3; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return name.trim().substring(0,4).toUpperCase() + parseInt(Math.random() * (999 - 100) + 100).toString()+ result.toUpperCase();
}
module.exports = foodController