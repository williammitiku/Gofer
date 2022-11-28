const express =  require('express')
var router = express.Router()

const bikerController = require('../controller/bikerController')

const authAdmins = require('../middleware/authAdmins') 
const authA = require('../middleware/authA') 
const authB = require('../middleware/authM') 



router.post('/login', bikerController.login)
router.post('/createBiker', authA, authAdmins, bikerController.createBiker)
router.post('/verify',authB, bikerController.verify)
router.post('/forgetPassword', bikerController.forgetPassword)
router.post('/deleteBiker', authA, authAdmins, bikerController.deleteBiker)
router.post('/changeBikerStatus',authB,  bikerController.changeBikerStatus)
router.get('/listBiker', authA, authAdmins, bikerController.listBiker)






//router.post('/verify',  authA,authAdmins, adminController.verify); 
//router.post('/forgetPassword', adminController.forgetPassword); 
//router.get('/listDrivers', authDriver, adminController.listDrivers); 
//router.post('/changeAdminStatus', adminController.changeDriverStatus); 
//router.post('/deleteAdmin', adminController.deleteDriver); 
//router.post('/update', adminController.deleteDriver); 
// router.post('/refreshToken', authRefresh, userController.refreshToken);


module.exports = router;
