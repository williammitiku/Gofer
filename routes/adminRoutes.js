const express =  require('express')
var router = express.Router()

const adminController = require('../controller/adminController')

const authAdmins = require('../middleware/authAdmins') 
const authA = require('../middleware/authA') 
router.post('/login', adminController.login)


router.post('/login', adminController.login)
router.post('/createAdmin',authA,authAdmins, adminController.createAdmin)
router.post('/createRestaurantAdmin',authA,authAdmins, adminController.createRestaurantAdmin)
router.post('/verify',  authA,authAdmins, adminController.verify); 
router.post('/forgetPassword', adminController.forgetPassword); 
router.post('/update',authA,authAdmins, adminController.update); 
router.get('/listAllAdmin',authA,authAdmins, adminController.listAllAdmin); 
router.get('/ListRestaurantAdmin',authA,authAdmins, adminController.ListRestaurantAdmin); 
router.get('/listAdmin',authA,authAdmins, adminController.listAdmin); 
//router.get('/listDrivers', authDriver, adminController.listDrivers); 
//router.post('/changeAdminStatus', adminController.changeDriverStatus); 
//router.post('/deleteAdmin', adminController.deleteDriver); 
//router.post('/update', adminController.deleteDriver); 
// router.post('/refreshToken', authRefresh, userController.refreshToken);


module.exports = router;
