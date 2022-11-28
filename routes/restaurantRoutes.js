const express = require("express")
const router = express.Router();

const restaurantController = require('../controller/restaurantController')

const auth = require('../middleware/auth')
const authA = require('../middleware/authA')
const authAdmins = require('../middleware/authAdmins')

router.post("/create", authA, authAdmins, restaurantController.create)
router.post("/register", authA, authAdmins, restaurantController.register)
router.get("/getAll", auth, restaurantController.getAll)
router.get("/getAllRestaurants", authA, authAdmins, restaurantController.getAll)
router.post("/delete", authA, authAdmins, restaurantController.delete)
router.post("/update", authA, authAdmins, restaurantController.update)
router.post("/getNearyBy", restaurantController.getNearyBy)


module.exports = router;


