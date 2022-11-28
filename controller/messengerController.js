const { Messengers } = require('../model/messenger')
const jwt = require("jsonwebtoken");
const emailController = require('../helper/emailController')
const { json } = require('body-parser');
// const bcrypt = require("bcryptjs");

const messengerController = {
   
    login: async (req, res) => {
        const { email, password, deviceId } = req.body;
        
        try {
            var messengerData = await Messengers.findOne({ email: email });
            if (!messengerData) {
              return res.status(200).json({status: "error", message: "Messenger not found" });
            }

            messengerData.comparePassword(password, async (matchError, isMatch) => {
              if (matchError) {
                  return res.status(200).json({status: "error", message: "something went wrong" });
              }
              if (!isMatch) {
                  return res.status(200).json({status: "error", message: "Incorrect password" });
              }

            
              
              const token = createAccessToken(messengerData._id)
              const refreshToken = createRefreshToken(messengerData._id)
  
              return res.status(200).json({status: "success", messenger: messengerData, token, refreshToken });

            });
        } catch (e) {
            return  res.status(200).json({status: "error", message: e.message})
        }
    },




    
  createMessenger: async (req, res) => {
        try {
            const messenger =req.body;
           // var driver2 = generateDriverId('Driver');
           // driver.driverId=driver2;
            const existingMessenger = await Messengers.findOne({
                email: messenger.email,
              });
              if (existingMessenger) {
                return res.status(200).json({status: "error", message: "Messenger already exists" });
              }

              messenger.role = 0; //Driver access

              messenger.loadType='heavyweight'; 
              messenger.isCar=true; 

            // var imageUrls = imageConverter.convert([user.profileImage]);
            
            // if (!imageUrls) {
            //     return res.status(200).json({status: "error", message: "unable to save images" });
            // }

            // user.profileImage = imageUrls[0];

            var newMessenger = await Messengers.create(messenger)
            if(!newMessenger) return res.status(200).json({status: "error",  message:"Messenger registration failed", messenger: messenger }); 
            
            await newMessenger.generateVerificationToken(async (verificationCode, defaultPassword) => {
                if(!verificationCode || !defaultPassword) return res.status(200).json({status: "error", message: "operation failed. couldn't generate verification code"})

                emailController.sendVerificationEmail(newMessenger.email, verificationCode, defaultPassword);

                delete newMessenger.password;
                delete newMessenger.role;
    
                return res.status(200).json({
                    status: "success", 
                    message: `Messenger registered. A verification email is send to ${messenger.email}`, 
                    messenger: messenger 
                });              
            });
        } catch (e) {
            console.log(e);
            return  res.status(500).json({message: e.message})
        }
    },


    createBikeMessenger: async (req, res) => {
        try {
            const messenger =req.body;
           // var driver2 = generateDriverId('Driver');
           // driver.driverId=driver2;
            const existingMessenger = await Messengers.findOne({
                email: messenger.email,
              });
              if (existingMessenger) {
                return res.status(200).json({status: "error", message: "Messenger already exists" });
              }

              messenger.role = 0;
              messenger.loadType='light'; 
              messenger.isCar=false; //Driver access

            // var imageUrls = imageConverter.convert([user.profileImage]);
            
            // if (!imageUrls) {
            //     return res.status(200).json({status: "error", message: "unable to save images" });
            // }

            // user.profileImage = imageUrls[0];

            var newMessenger = await Messengers.create(messenger)
            if(!newMessenger) return res.status(200).json({status: "error",  message:"Messenger registration failed", messenger: messenger }); 
            
            await newMessenger.generateVerificationToken(async (verificationCode, defaultPassword) => {
                if(!verificationCode || !defaultPassword) return res.status(200).json({status: "error", message: "operation failed. couldn't generate verification code"})

                emailController.sendVerificationEmail(newMessenger.email, verificationCode, defaultPassword);

                delete newMessenger.password;
                delete newMessenger.role;
    
                return res.status(200).json({
                    status: "success", 
                    message: `Messenger registered. A verification email is send to ${messenger.email}`, 
                    messenger: messenger 
                });              
            });
        } catch (e) {
            console.log(e);
            return  res.status(500).json({message: e.message})
        }
    },

    verify: async (req, res) => {
        const { verificationCode } = req.body;
        
        // Step 1 -  Verify the token from the URL
        if (!verificationCode) {
            return res.status(200).send({ 
                status: "error",
                 message: "Missing Token" 
            });
        }        

        try{
            // Step 2 - Find Messenger with matching ID
            const messenger = await Messengers.findOne({ verificationCode: verificationCode }).exec();
            if (!messenger) {
               return res.status(200).send({ 
                    status: "error",
                    message: "Messenger does not  exists",
                    defaultPassword: messenger.password 
               });
            }

            // Step 3 - Update Driver verification status to true
            messenger.isVerified = true;
            await messenger.save();
            
            return res.status(200).send({
                status: "success",
                message: "Account Verified"
            });

         } catch (err) {
            return res.status(500).send({status: "error", err});
         }
    },

    forgetPassword: async (req, res) => {
        try {
            const {email}  = req.body

            var messenger = await Messengers.findOne({email: email})
            if(!messenger) return res.status(200).json({status: "error",  message:"Messenger not found" }); 
            
            await messenger.generateVerificationToken(async (verificationCode, defaultPassword) => {
                if(!defaultPassword) return res.status(200).json({status: "error", message: "operation failed. couldn't generate reset key"})

                messenger.password = defaultPassword;
                messenger.save();

                emailController.sendForgetPasswordEmail(email, defaultPassword);

                delete messenger.password;
                delete messenger.role;
    
                return res.status(200).json({
                    status: "success", 
                    message: `A new password reset key is sent via email to ${messenger.email}`, 
                    messenger 
                });
                
            });

        } catch (e) {
            console.log(e);
            return  res.status(500).json({message: e.message})
        }
    },
    

    

deleteMessenger: async (req, res) => {
    try {
        const { email } =req.body;

        const messenger = await Messengers.findOne({email: email});
        
        if (!messenger) {
            return res.status(200).json({status: "error", message: "Messenger not found" });
          }

        const result = await Messengers.deleteOne({email: email})
        if (result.deletedCount === 1) {
            return res.status(200).json({status: "success", message:"Messenger deleted" });
        } else {
            return res.status(200).json({status: "error",  message:"Deleting Messenger failed" }); 
        }
        
    } catch (e) {
        console.log(e);
        return  res.status(500).json({message: e.message})
    }
},



changeMessengerStatus: async (req, res) => {
    try {
        
        const { messengerId, isDisabled } = req.body;

        const messenger = await Messengers.findById(messengerId)
        if(!messenger) return res.status(200).json({status: "error", message: "Messenger not found" });

        const result = await Messengers.findOneAndUpdate(
            {_id: messengerId},
            {
                $set: {
                  isDisabled: isDisabled
                },
            },
            {new:true}
            );
        if (result) return res.status(200).json({status: "success", message:"Messenger status changed"});

        return res.status(200).json({status: "error",  message:"Changing Messenger status failed" }); 
    } catch (e) {
        console.log(e);
        return  res.status(500).json({message: e.message})
    }
},




listMessenger: async (req, res) => {
    try {

        var messengers = await Messengers.find();
        if(!messengers) return res.status(200).json({status: "error",  message:"no messengers found"}); 

        return res.status(200).json({
            status: "success", 
            message: 'success', 
            messengers: messengers 
        });
    } 
    catch (e) {
        console.log(e);
        return  res.status(500).json({status: "error", message: e.message})
    }
},

GetAllBikeMessenger: async (req, res) => {
    try {

        var messengers = await Messengers.find({loadType: "light"});
        if(!messengers) return res.status(200).json({status: "error",  message:"no messengers found"}); 

        return res.status(200).json({
            status: "success", 
            message: 'success', 
            messengers: messengers 
        });
    } 
    catch (e) {
        console.log(e);
        return  res.status(500).json({status: "error", message: e.message})
    }
},


GetAllCarMessenger: async (req, res) => {
    try {

        var messengers = await Messengers.find({loadType: "heavyweight"});
        if(!messengers) return res.status(200).json({status: "error",  message:"no messengers found"}); 

        return res.status(200).json({
            status: "success", 
            message: 'success', 
            messengers: messengers 
        });
    } 
    catch (e) {
        console.log(e);
        return  res.status(500).json({status: "error", message: e.message})
    }
},



    refreshToken: (req, res) =>{
        try {
            const driverData = req.driverData
            
            const accessToken = createAccessToken(driverData.driverId)
            const refreshToken = createRefreshToken(driver.driverId)

            if (!accessToken || !refreshToken) return res.status(200).json({status: "error", message: "refresh token failed" });

            return res.status(200).json({
                status:'success',
                message:'token refreshed', 
                token: accessToken, 
                refreshToken: refreshToken,
            })

        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: error.message
            })
        }
    },
    
  
}

const createAccessToken = (id) =>{
    return jwt.sign({ driverId: id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1d"});
}

const createRefreshToken = (id) => {
    return jwt.sign({ driverId: id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "365d"});
}
function generateDriverId (name) {
    var result           = '';
    var characters       = '0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < 3; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return name.trim().substring(0,6).toUpperCase() + parseInt(Math.random() * (999 - 100) + 100).toString()+ result.toUpperCase();
};
module.exports = messengerController;