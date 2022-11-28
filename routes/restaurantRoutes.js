const express = require("express")
const router = express.Router();

const restaurantController = require('../controller/restaurantController')

const auth = require('../middleware/auth')
const authA = require('../middleware/authA')
const authAdmins = require('../middleware/authAdmins')

router.post("/create", authA, authAdmins, restaurantController.create)
router.post("/register", authA, authAdmins, restaurantController.register)
router.post("/getAll", auth, restaurantController.getAll)
router.post("/delete", authA, authAdmins, restaurantController.delete)
router.post("/update", authA, authAdmins, restaurantController.update)

module.exports = router;


