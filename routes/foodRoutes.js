const express = require("express")
const router = express.Router();

const foodController = require('../controller/foodController')
const auth = require('../middleware/auth')
const authA = require('../middleware/authA')
const authAdmins = require('../middleware/authAdmins')
const authRestaurant = require('../middleware/authRestaurant')

router.post("/create", authA, foodController.create)
router.get("/getAll", authA,  foodController.getAll)
router.post("/getFoodByRestaurant", authA, authRestaurant, foodController.getFoodByRestaurant)
router.post("/getFoodByCategory", authA, authRestaurant,  foodController.getFoodByCategory)
router.get("/getAllCategory", auth,  foodController.getAllCategory)

router.post("/delete", authA, foodController.delete)
router.post("/update", authA, foodController.update)

module.exports = router;
