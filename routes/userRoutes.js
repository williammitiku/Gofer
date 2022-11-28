const express =  require('express')
var router = express.Router()

const userController = require('../controller/userController')

const auth = require('../middleware/auth')
const authAdmin = require('../middleware/authAdmin')
const authDriver = require('../middleware/authD')
const authRefresh = require('../middleware/authRefresh')

// router.post('/login', userController.login)

router.post('/forgetPassword', userController.forgetPassword);
router.post('/getToken', userController.getToken);

router.post('/createUser', userController.createUser)
router.post('/changeUserStatus', auth, authAdmin, userController.changeUserStatus)
router.post('/update', auth, userController.update)

router.get('/listUsers', userController.listUsers)

router.post('/refreshToken', authRefresh, userController.refreshToken);


module.exports = router;
