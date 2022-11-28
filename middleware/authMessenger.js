const { Messengers, Messenger }= require('../model/messenger')

const authMessenger = async (req, res, next) =>{
    try {
        // Get user information by id
        console.info(req);
        const messenger = await Messengers.findOne({
            _id: req.messenger.messengerId
        })
        if(messenger.role !== 1)
            return res.status(400).json({status: "error", message: "Messenger resources access denied"})
        // req.user = user;
        next()
    } catch (err) {
        return res.status(500).json({status: "error", message: err.message})
    }
}
module.exports = authAdmins
