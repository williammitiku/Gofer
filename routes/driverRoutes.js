const express =  require('express')
var router = express.Router()

const driverController = require('../controller/driverController')

const authA = require('../middleware/authA')
const authAdmins = require('../middleware/authAdmins')
const authDriver = require('../middleware/authD')
const authRefresh = require('../middleware/authRefresh')

router.post('/login', driverController.login)
router.post('/createDriver', authA, authAdmins, driverController.createDriver)
router.post('/verify',  authDriver, driverController.verify); 
router.post('/forgetPassword', driverController.forgetPassword); 
router.get('/listDrivers', authA, authAdmins,  driverController.listDrivers); 
router.post('/changeDriverStatus', authA, authAdmins, driverController.changeDriverStatus); 
router.post('/deleteDriver', authA, authAdmins, driverController.deleteDriver); 
router.post('/update',authA, authAdmins, driverController.update); 






router.post('/refreshToken', authRefresh, driverController.refreshToken);


module.exports = router;
