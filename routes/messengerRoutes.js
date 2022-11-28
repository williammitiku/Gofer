const express =  require('express')
var router = express.Router()

const messengerController = require('../controller/messengerController')

const authAdmins = require('../middleware/authAdmins') 
const authA = require('../middleware/authA') 
const authM = require('../middleware/authM') 



router.post('/login', messengerController.login)
router.post('/createMessenger', authA, authAdmins, messengerController.createMessenger)
router.post('/createBikeMessenger',authA,authAdmins, messengerController.createBikeMessenger)
router.post('/verify',authM, messengerController.verify)
router.post('/forgetPassword', messengerController.forgetPassword)
router.post('/deleteMessenger', authM, messengerController.deleteMessenger)
router.post('/changeMessengerStatus',authM,  messengerController.changeMessengerStatus)
router.get('/GetAllBikeMessenger', authA, authAdmins, messengerController.GetAllBikeMessenger)
router.get('/GetAllCarMessenger', authA, authAdmins, messengerController.GetAllCarMessenger)






//router.post('/verify',  authA,authAdmins, adminController.verify); 
//router.post('/forgetPassword', adminController.forgetPassword); 
//router.get('/listDrivers', authDriver, adminController.listDrivers); 
//router.post('/changeAdminStatus', adminController.changeDriverStatus); 
//router.post('/deleteAdmin', adminController.deleteDriver); 
//router.post('/update', adminController.deleteDriver); 
// router.post('/refreshToken', authRefresh, userController.refreshToken);


module.exports = router;
