const express =  require('express')
var router = express.Router()

const rideController = require('../controller/rideController')

const auth = require('../middleware/auth')
const authAdmin = require('../middleware/authAdmin')
const authDriver = require('../middleware/authDriver')
const authRefresh = require('../middleware/authRefresh')

router.post('/getPrice', auth, rideController.getPrice)
router.post('/search', auth, rideController.search)

module.exports = router;
