const express = require('express');
const router = express.Router();

const orderController = require('../controller/orderController')

const auth = require('../middleware/auth')
const authA = require('../middleware/authA')
// const authCustomer = require('../middleware/authCustomer')
const authDriver = require('../middleware/authDriver')
const authAdmins = require('../middleware/authAdmins');
const authRestaurant = require('../middleware/authRestaurant');

router.post('/create', auth, orderController.createOrder)

router.get('/getAllOrders', authA, authAdmins, orderController.getAllOrders)

router.get('/get', authA, orderController.getMyOrders)
router.post("/getOrderInfoById", auth, orderController.getOrderInfoById)
router.post("/getOrderInfoByOrderId", auth, orderController.getOrderInfoByOrderId)
router.get("/getAllOrdersToday", auth, orderController.getAllOrdersToday)
router.get("/getAllOrdersWeekly", auth, orderController.getAllOrdersWeekly)
router.get("/getAllOrdersMonthly", auth, orderController.getAllOrdersMonthly)
router.post("/ConfirmDelivery", authA, authAdmins, orderController.ConfirmDelivery)
router.post("/getAllOrdersTodayByRestaurant", authA, orderController.getAllOrdersTodayByRestaurant)
router.post("/getAllOrdersWeeklyByRestaurant", authA, orderController.getAllOrdersWeeklyByRest)
router.post("/getAllOrdersMonthlyByRestaurant", authA, orderController.getAllOrdersMonthlyByRest)



router.post("/getOrdersByRestaurant", authA, authRestaurant, orderController.getOrdersByRestaurant)
router.post("/getOrdersByRestaurant", authA, authRestaurant, orderController.getOrdersByRestaurant)
router.post("/getRequestedOrdersByRestaurant", authA, authRestaurant, orderController.getRequestedOrdersByRestaurant)



router.post("/assignBiker", authA, authAdmins, orderController.assignBiker)



/*
router.get("/getAssigned", auth, authDriver, orderController.getAssignedOrders)
router.get("/getAll", auth, authAdmin, orderController.getAllOrders)
router.post("/getByStatus", auth, authAdmin, orderController.getByStatus)

router.get("/getAllToday", auth, authAdmin, orderController.getAllOrdersToday)
router.get("/getAllWeekly", auth, authAdmin, orderController.getAllOrdersWeekly)
router.get("/getAllMonthly", auth, authAdmin, orderController.getAllOrdersMonthly)

router.post("/assignDriver", auth, authAdmin, orderController.assignDriver)
router.post("/startDelivery", auth, authDriver, orderController.startDelivery)
// router.post("/confirmDelivery", auth, authCustomer, orderController.confirmDelivery)
router.post("/paymentReceived", auth, authDriver, orderController.paymentReceived)
router.post("/updateLocation", auth, authDriver, orderController.updateLocation)
router.get("/getAllOrdersCount", auth, authAdmin, orderController.getAllOrdersCount)

router.post("/assignDriver", auth, authAdmin, orderController.assignDriver)
router.post("/startDelivery", auth, authDriver, orderController.startDelivery)
// router.post("/confirmDelivery", auth, authCustomer, orderController.confirmDelivery)
router.post("/paymentReceived", auth, authDriver, orderController.paymentReceived)
router.post("/updateLocation", auth, authDriver, orderController.updateLocation)
router.get("/getAllOrdersCount", auth, authAdmin, orderController.getAllOrdersCount)

*/
module.exports = router