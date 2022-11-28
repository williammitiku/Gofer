const { Admins, Admin }= require('../model/admin')

const authRestaurant = async (req, res, next) =>{
    try {
        // Get user information by id
        console.info(req);
        const admin = await Admins.findOne({
            _id: req.admin.adminId
        })
        if(admin.role !== 0)
            return res.status(400).json({status: "error", message: "Restaurant resources access denied"})

        // req.user = user;
        next()

    } catch (err) {
        return res.status(500).json({status: "error", message: err.message})
    }
}
module.exports = authRestaurant
