const {Admin} = require('../model/admin')

const authAdmin = async (req, res, next) =>{
    try {
        // Get user information by id
        const admin = await Admin.findOne({
            _id: req.admin.adminId
        })
        if(admin.role !== 1)
            return res.status(400).json({status: "error", message: "Admin resources access denied"})

        // req.user = user;
        next()

    } catch (err) {
        return res.status(500).json({status: "error", message: err.message})
    }
}
module.exports = authAdmin
