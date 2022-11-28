
const router = require('express').Router()

const priceController = require('../controller/priceController')
const authA = require('../middleware/authA')

router.post('/add', authA, priceController.add);
router.get('/get',authA,  priceController.get);
router.post('/update',authA,  priceController.update);

module.exports = router;
