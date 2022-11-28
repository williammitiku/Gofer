
const router = require('express').Router()

const priceController = require('../controller/priceController')

router.post('/add', priceController.add);
router.get('/get', priceController.get);
router.post('/update', priceController.update);

module.exports = router;
