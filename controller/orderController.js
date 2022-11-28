const { Orders, OrderStatus, PaymentType } = require('../model/order')
const { Users } = require('../model/user')
const { Foods } = require('../model/food')
const { Bikers } = require('../model/biker')
const { Restaurants, restaurant } = require('../model/restaurant')
const notification = require('../helper/notification')
const distance = require('../helper/distance')
const clearCache = require("../services/cache");

const orderController = {
    
    createOrder: async (req, res) => {

        try {

            const { orders, location, restId, paymentType } = req.body;

            const userInfo = await Users.findById(req.user.userId)

            if(!orders) return res.status(200).json({status: "error",  message:"empty order list "}); 

            var foods = await Foods.find().cache()
            //const foodinfo = await Foods.find(orders.foodId).select('-password')
            //console.log(foodinfo.foodPrice)
            var deliveryPrice = 0;
            var foodPrice = 0;
            const foodInfo = await Foods.findOne({foodId: orders.foodId});
            
            orders.forEach(async (order) => {
                var food = foods.find(function (item) {
                    return item.foodId == order.foodId;
                  });

                if(food)
                    foodPrice = foodPrice + (order.quantity * food.foodPrice)
              })
              const restaurantInfo = await Restaurants.findOne({restId: restId}, {"image":0})


              if(restaurantInfo && restaurantInfo.location) {
                var _distance = distance.calculate(
                    location.latitude, location.longitude, restaurantInfo.location.latitude, restaurantInfo.location.longitude)
                if(_distance < 10) deliveryPrice = 30
                else if(_distance < 20) deliveryPrice = 50
                else if(_distance <  30) deliveryPrice = 70
         
              }

            var newOrder = await Orders.create({
                orderId: generateOrderId(),
                userId: req.user.userId,
                userInfo,
                restId:restId,
                restaurantInfo,
                orders: orders,
                userLocation: location,
                paymentType: paymentType,
                foodPrice,
                deliveryPrice,
                totalPrice: deliveryPrice + foodPrice,
                status: OrderStatus.REQUESTED
            });
            
            if(!newOrder) return res.status(200).json({status: "error",  message:"order creating failed"}); 
    
            clearCache(Orders.collection.collectionName);

            if(paymentType == PaymentType.CARD) {

                //return payment options here
                return res.status(200).json({
                    status: "success", 
                    message: 'order created successfully', 
                    paymentOptions: [],
                    order: newOrder 
                });
            }
            else {
                return res.status(200).json({
                    status: "success", 
                    message: 'order created successfully', 
                    order: newOrder 
                });
            }
        } 
        catch (e) {
            console.log(e);
            return  res.status(500).json({status: "error", message: e.message})
        }
    },
    getMyOrders: async (req, res) => {
        try {
            var orders = await Orders.find({userId: req.user.userId})
            if(!orders) return res.status(200).json({status: "error",  message:"no orders found"}); 
    
            return res.status(200).json({
                status: "success", 
                message: 'success', 
                orders: orders 
            });
        } 
        catch (e) {
            console.log(e);
            return  res.status(500).json({status: "error", message: e.message})
        }
    },

    getOrderInfoById: async (req, res) => {
        try {

            var { orderId } = req.body
            orderId = orderId.toUpperCase()
            
            var order = await Orders.findOne({orderId: orderId, userId: req.user.userId})
            if(!order) return res.status(200).json({status: "error",  message:"no order found"}); 
    
            return res.status(200).json({
                status: "success", 
                message: 'success', 
                order: order 
            });
        } 
        catch (e) {
            console.log(e);
            return  res.status(500).json({status: "error", message: e.message})
        }
    },

    getOrdersByRestaurant: async (req, res) => {
        try {
            const {restId} = req.body;
      
            var orders = await Orders.find({restId: restId})
            if(!orders) return res.status(200).json({status: "error",  message:"no Orders found"}); 
            
            return res.status(200).json({
                
                status: "success", 
                message: 'success', 
                orders
            });
        } 
        catch (e) {
            console.log(e);
            return  res.status(500).json({status: "error", message: e.message})
        }
    },

    getRequestedOrdersByRestaurant: async (req, res) => {
        try {
            const {restId} = req.body;
      
            var orders = await Orders.find({restId: restId, status:"requested"})
            if(!orders) return res.status(200).json({status: "error",  message:"no Orders found"}); 
            return res.status(200).json({
                
                status: "success", 
                message: 'success', 
                orders
            });
        } 
        catch (e) {
            console.log(e);
            return  res.status(500).json({status: "error", message: e.message})
        }
    },

    getOrderInfoByOrderId: async (req, res) => {
        try {

            var { orderId} = req.body
            orderId = orderId.toUpperCase()
            
            var order = await Orders.find({orderId: orderId})
            if(!order) return res.status(200).json({status: "error",  message:"no order found"}); 
    
            return res.status(200).json({
                status: "success", 
                message: 'success', 
                order: order 
            });
        } 
        catch (e) {
            console.log(e);
            return  res.status(500).json({status: "error", message: e.message})
        }
    },

    getAssignedOrders: async (req, res) => {
        try {

            var orders = await Orders.find({driverId: req.user.userId})
            if(!orders) return res.status(200).json({status: "error",  message:"no orders found"}); 
    
            return res.status(200).json({
                status: "success", 
                message: 'success', 
                orders: orders 
            });
        } 
        catch (e) {
            console.log(e);
            return  res.status(500).json({status: "error", message: e.message})
        }
    },

    getAllOrders: async (req, res) => {
        try {

            var orders = await Orders.find().sort({"createdAt":-1});
            if(!orders) return res.status(200).json({status: "error",  message:"no orders found"}); 
    
            return res.status(200).json({
                status: "success", 
                message: 'success', 
                orders: orders 
            });
        } 
        catch (e) {
            console.log(e);
            return  res.status(500).json({status: "error", message: e.message})
        }
    },
    
    getByStatus: async (req, res) => {
        try {

            var {status} = req.body;

            var orders = await Orders.find({status: status.toLowerCase()}).sort({"updatedAt":-1});
            if(!orders || orders.length === 0) return res.status(200).json({status: "error",  message:"no orders found"}); 
    
            return res.status(200).json({
                status: "success", 
                message: 'success', 
                orders: orders 
            });
        } 
        catch (e) {
            console.log(e);
            return  res.status(500).json({status: "error", message: e.message})
        }
    },

    getAllOrdersToday: async (req, res) => {
        try {

            var now = new Date();
            var startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            var orders = await Orders.find({createdAt: {$gte: startOfToday}}).count();

            if(!orders) return res.status(200).json({status: "error",  message:"no orders found"}); 
    
            return res.status(200).json({
                status: "success", 
                message: 'success', 
                orders: orders 
            });
        } 
        catch (e) {
            console.log(e);
            return  res.status(500).json({status: "error", message: e.message})
        }
    },

    getAllOrdersTodayByRestaurant: async (req, res) => {
        try {
            const {restId} = req.body;
            var now = new Date();
             var startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            var orders = await Orders.find({restId: restId, createdAt: {$gte: startOfToday}});
            var ordersCount=await Orders.find({restId: restId, createdAt: {$gte: startOfToday}}).count();

            if(!orders) return res.status(200).json({status: "error",  message:"no orders found"}); 
    
            return res.status(200).json({
                status: "success", 
                message: 'success', 
                ordersCount, 
                orders: orders 
             
            });
        } 
        catch (e) {
            console.log(e);
            return  res.status(500).json({status: "error", message: e.message})
        }
    },

    getAllOrdersWeekly: async (req, res) => {
        try {

            var d = new Date();
            d.setDate(d.getDate() -7);
            var orders = await Orders.find({createdAt : {$gte: d}}).count();

            if(!orders) return res.status(200).json({status: "error",  message:"no orders found"}); 
    
            return res.status(200).json({
                status: "success", 
                message: 'success', 
                orders: orders 
            });
        } 
        catch (e) {
            console.log(e);
            return  res.status(500).json({status: "error", message: e.message})
        }
    },

    getAllOrdersWeeklyByRest: async (req, res) => {
        try {
            const {restId} = req.body;
            var d = new Date();
            d.setDate(d.getDate() -7);
             var orders= await Orders.find({restId: restId, createdAt : {$gte: d}});
             var ordersCount = await Orders.find({restId: restId, createdAt : {$gte: d}}).count();


            if(!orders) return res.status(200).json({status: "error",  message:"no orders found"}); 
    
            return res.status(200).json({
                status: "success", 
                message: 'success',
                ordersCount,
                orders: orders
            });
        } 
        catch (e) {
            console.log(e);
            return  res.status(500).json({status: "error", message: e.message})
        }
    },

    getAllOrdersMonthly: async (req, res) => {
        try {

            var d = new Date();
            d.setDate(d.getDate() -30);
            var orders = await Orders.find({createdAt : {$gte: d}}).count();

            if(!orders) return res.status(200).json({status: "error",  message:"no orders found"}); 
    
            return res.status(200).json({
                status: "success", 
                message: 'success', 
                orders: orders 
            });
        } 
        catch (e) {
            console.log(e);
            return  res.status(500).json({status: "error", message: e.message})
        }
    },

    getAllOrdersMonthlyByRest: async (req, res) => {
        try {
            const {restId} = req.body;
            var d = new Date();
            d.setDate(d.getDate() -30);
            var orders = await Orders.find({restId, restId, createdAt : {$gte: d}}).count();
            var ordersCount = await Orders.find({restId, restId, createdAt : {$gte: d}});


            if(!orders) return res.status(200).json({status: "error",  message:"no orders found"}); 
    
            return res.status(200).json({
                status: "success", 
                message: 'success', 
                ordersCount,
                orders: orders 
            });
        } 
        catch (e) {
            console.log(e);
            return  res.status(500).json({status: "error", message: e.message})
        }
    },


    assignBiker: async (req, res) => {
        try{
          
            var { bikerId, orderId } = req.body;
            const biker = await Bikers.findById(bikerId).select('-password');
            if(!biker) return res.status(200).json({status: "error", message: "Biker not found" });
            
          //  orderId = orderId.toUpperCase()
    
            const newOrder = await Orders.findOneAndUpdate(
                {orderId: orderId},
                    {
                        $set: {
                            bikerId,
                            bikerInfo: biker,
                            status: OrderStatus.DRIVER_ASSIGNED
                        },
                    },
                    {new:true}
            );
            
            if(newOrder) {
                res.status(200).json({status: "success", message: "Biker assigned to order successfully", order: newOrder});
    
                if(biker.deviceId) {
                    await notification.send(
                        biker.deviceId,
                        {
                            title: "Delivery Assignment",
                            body: `Dear, You are assigned to deliver for ${orderId}`
                        }, 
                        {
                            "orderId": orderId,
                            "message": "Dear TESFALEM NIGUSSIE, Thank you for Choosing Elite Water!",
                        }
                    );
                }
                
                if(newOrder.userInfo.deviceId) {
                    await notification.send(
                        newOrder.userInfo.deviceId,
                        {
                            title: "Driver Assigned",
                            body: `Dear, a Biker is assigned to deliver your order: ${orderId}`
                        }, 
                        {
                            "orderId": orderId,
                            "message": "Dear TESFALEM NIGUSSIE, Thank you for Choosing Elite Water!",
                        }
                    );
                }
    
            }
            else return res.status(200).json({status: "error", message: "Biker assigning failed"});
        } 
        catch (e) {
            console.log(e);
            return  res.status(500).json({status: "error", message: e.message})
        } 
    },
    
    ConfirmDelivery: async (req, res) => {
        try {
            
            const {orderId}  = req.body;
    
            const order = await Orders.findOne({orderId: orderId})
            if(!order) return res.status(200).json({status: "error", message: "Order not found" });
    
            const result = await Orders.findOneAndUpdate(
                {orderId: orderId},
                {
                    $set: {
                      status: OrderStatus.CONFIRMED
                    },
                },
                {new:true}
                );
            if (result) return res.status(200).json({status: "success", message:"Order status changed"});
    
            return res.status(200).json({status: "error",  message:"Changing Biker status failed" }); 
        } catch (e) {
            console.log(e);
            return  res.status(500).json({message: e.message})
        }
    },
    
    startDelivery: async (req, res) => {
        try{
          
            const { orderId } = req.body;
            
            const newOrder = await Orders.findOneAndUpdate(
                {orderId: orderId, driverId: req.user.userId},
                    {
                        $set: {
                            status: OrderStatus.ON_THE_WAY
                        },
                    },
                    {new:true}
            );
            
            if(newOrder) {
                res.status(200).json({status: "success", message: "order updated successfully", order: newOrder});
                
                const user = await Users.findById(newOrder.userId);
                if(user.deviceId) {
                    await notification.send(
                        user.deviceId,
                        {
                            title: "Delivery On the way",
                            body: `Dear, You order is on the way.`
                        }, 
                        {
                            "orderId": orderId,
                            "message": "Dear Biker, Thank you for Choosing Elite Water!",
                        }
                    );
                }
                
            }
            else return res.status(200).json({status: "error", message: "order update failed"});
        } 
        catch (e) {
            console.log(e);
            return  res.status(500).json({status: "error", message: e.message})
        } 
    },

    // confirmDelivery: async (req, res) => {
    //     try{
          
    //         const { orderId } = req.body;
            
    //         const newOrder = await Orders.findOneAndUpdate(
    //             {orderId: orderId, userId: req.user.userId},
    //                 {
    //                     $set: {
    //                         status: OrderStatus.DELIVERED
    //                     },
    //                 },
    //                 {new:true}
    //         );
            

    //         if(newOrder) {
    //             res.status(200).json({status: "success", message: "order delivery confirmed successfully", order: newOrder});
                
    //             const user = await Users.findById(newOrder.userId);
    //             if(user.deviceId) {
    //                 await notification.send(
    //                     user.deviceId,
    //                     {
    //                         title: "Thank you",
    //                         body: `Dear, Thanks for doing business with us.`
    //                     }, 
    //                     {
    //                         "orderId": orderId,
    //                         "message": "Dear User, Thank you for Choosing Elite Water!",
    //                     }
    //                 );
    //             }

    //             const driver = await Users.findById(newOrder.driverId);
    //             if(driver.deviceId) {
    //                 await notification.send(
    //                     driver.deviceId,
    //                     {
    //                         title: "Delivery Completed",
    //                         body: `Dear, the delivery to ${orderId} is confirmed by the customer. Good Job.`
    //                     }, 
    //                     {
    //                         "orderId": orderId,
    //                         "message": "Dear User, Thank you for Choosing Elite Water!",
    //                     }
    //                 );
    //             }
                
    //         }
    //         else {
    //             return res.status(200).json({status: "error", message: "order delivery confirmation failed"});
    //         }
    //     } 
    //     catch (e) {
    //         console.log(e);
    //         return  res.status(500).json({status: "error", message: e.message})
    //     } 
    // },

    paymentReceived: async (req, res) => {
        try{
          
            const { orderId } = req.body;
            
            const newOrder = await Orders.findOneAndUpdate(
                {orderId: orderId, driverId: req.user.userId},
                    {
                        $set: {
                            status: OrderStatus.PAYMENT_RECEIVED
                        },
                    },
                    {new:true}
            );
            
            if(newOrder) {
                res.status(200).json({status: "success", message: "order updated successfully", order: newOrder});
                
            }
            else return res.status(200).json({status: "error", message: "order update failed"});
        } 
        catch (e) {
            console.log(e);
            return  res.status(500).json({status: "error", message: e.message})
        } 
    },

    updateLocation: async (req, res) => {
        try{
          
            const { orderId, location } = req.body;
            
            const order = await Orders.findOneAndUpdate(
                {orderId: orderId, driverId: req.user.userId },
                { $push: { path: location } },
                {new:true}
            );
            
            if(order) {
                res.status(200).json({status: "success", message: "location updated successfully"});

                const user = await Users.findById(order.userId);
                if(user.deviceId) {
                    await notification.send(
                        user.deviceId,
                        null, 
                        {
                            "orderId": orderId,
                            "location": location,
                        }
                    );
                }

                notification.send()

            }
            else return res.status(200).json({status: "error", message: "order update failed"});
        } 
        catch (e) {
            console.log(e);
            return  res.status(500).json({status: "error", message: e.message})
        } 
    },
    
    getAllOrdersCount: async (req, res) => {
        try {

            const aggregatorOpts = [{
                $unwind: "$orders"
            },
            {
                $group: {
                    _id: "$orders.itemCode",
                    count: { $sum: '$orders.quantity' }
                }
            }
        ]

        var ordersCount = await Orders.aggregate(aggregatorOpts).exec();

            if(!ordersCount) return res.status(200).json({status: "error",  message:"no orders found"}); 
    
            return res.status(200).json({
                status: "success", 
                message: 'success', 
                ordersCount: ordersCount 
            });
        } 
        catch (e) {
            console.log(e);
            return  res.status(500).json({status: "error", message: e.message})
        }
    },
}

function generateOrderId() {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var charactersLength = characters.length;
    for ( var i = 0; i < 6; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
module.exports = orderController;