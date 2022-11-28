const express = require("express")
const router = express.Router();

const paymentController = require('../controller/paymentController')

router.post('/create', paymentController.create);
router.post('/confirm', paymentController.confirm);


module.exports = router;
