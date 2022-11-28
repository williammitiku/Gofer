const { Drivers, driver }= require('../model/driver')

const authDriver = async (req, res, next) =>{
    try {
        // Get user information by id
        console.info(req);
        const admin = await Drivers.findOne({
            _id: req.driver.driverId
        })
        // req.user = user;
        next()
    } catch (err) {
        return res.status(500).json({status: "error", message: err.message})
    }
}
module.exports = authDriver
