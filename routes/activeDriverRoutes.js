const express = require("express")
const router = express.Router();

const activeDriverController = require('../controller/activeDriverController')

const auth = require('../middleware/auth')
const authAdmin = require('../middleware/authAdmin')

router.post("/create", auth, activeDriverController.create)
router.post("/delete", auth, activeDriverController.delete)
router.post("/update", auth, activeDriverController.update)
router.get("/getAll", auth, activeDriverController.getAll)
router.post("/getNearest", auth, activeDriverController.getNearest)

module.exports = router;
