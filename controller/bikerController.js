const { Bikers } = require('../model/biker')
const jwt = require("jsonwebtoken");
const emailController = require('../helper/emailController')
const { json } = require('body-parser');
// const bcrypt = require("bcryptjs");

const bikerController = {
   
    login: async (req, res) => {
        const { email, password, deviceId } = req.body;
        
        try {
            var bikerData = await Bikers.findOne({ email: email });
            if (!bikerData) {
              return res.status(200).json({status: "error", message: "Biker not found" });
            }

            bikerData.comparePassword(password, async (matchError, isMatch) => {
              if (matchError) {
                  return res.status(200).json({status: "error", message: "something went wrong" });
              }
              if (!isMatch) {
                  return res.status(200).json({status: "error", message: "Incorrect password" });
              }

            
              
              const token = createAccessToken(bikerData._id)
              const refreshToken = createRefreshToken(bikerData._id)
  
              return res.status(200).json({status: "success", biker: bikerData, token, refreshToken });

            });
        } catch (e) {
            return  res.status(200).json({status: "error", message: e.message})
        }
    },




    
  createBiker: async (req, res) => {
        try {
            const biker =req.body;
           // var driver2 = generateDriverId('Driver');
           // driver.driverId=driver2;
            const existingBiker = await Bikers.findOne({
                email: biker.email,
              });
              if (existingBiker) {
                return res.status(200).json({status: "error", message: "Biker already exists" });
              }

              biker.role = 0; //Driver access

    

            // var imageUrls = imageConverter.convert([user.profileImage]);
            
            // if (!imageUrls) {
            //     return res.status(200).json({status: "error", message: "unable to save images" });
            // }

            // user.profileImage = imageUrls[0];

            var newBiker = await Bikers.create(biker)
            if(!newBiker) return res.status(200).json({status: "error",  message:"Biker registration failed", biker: biker }); 
            
            await newBiker.generateVerificationToken(async (verificationCode, defaultPassword) => {
                if(!verificationCode || !defaultPassword) return res.status(200).json({status: "error", message: "operation failed. couldn't generate verification code"})

                emailController.sendVerificationEmail(newBiker.email, verificationCode, defaultPassword);

                delete newBiker.password;
                delete newBiker.role;
    
                return res.status(200).json({
                    status: "success", 
                    message: `Biker registered. A verification email is send to ${biker.email}`, 
                    biker: biker 
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
            // Step 2 - Find Biker with matching ID
            const biker = await Bikers.findOne({ verificationCode: verificationCode }).exec();
            if (!biker) {
               return res.status(200).send({ 
                    status: "error",
                    message: "Biker does not  exists",
                    defaultPassword: biker.password 
               });
            }

            // Step 3 - Update Driver verification status to true
            biker.isVerified = true;
            await biker.save();
            
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

            var biker = await Bikers.findOne({email: email})
            if(!biker) return res.status(200).json({status: "error",  message:"Biker not found" }); 
            
            await biker.generateVerificationToken(async (verificationCode, defaultPassword) => {
                if(!defaultPassword) return res.status(200).json({status: "error", message: "operation failed. couldn't generate reset key"})

                biker.password = defaultPassword;
                biker.save();

                emailController.sendForgetPasswordEmail(email, defaultPassword);

                delete biker.password;
                delete biker.role;
    
                return res.status(200).json({
                    status: "success", 
                    message: `A new password reset key is sent via email to ${biker.email}`, 
                    biker 
                });
                
            });

        } catch (e) {
            console.log(e);
            return  res.status(500).json({message: e.message})
        }
    },
    

  

deleteBiker: async (req, res) => {
    try {
        const { email } =req.body;

        const biker = await Bikers.findOne({email: email});
        
        if (!biker) {
            return res.status(200).json({status: "error", message: "Biker not found" });
          }

        const result = await Bikers.deleteOne({email: email})
        if (result.deletedCount === 1) {
            return res.status(200).json({status: "success", message:"Biker deleted" });
        } else {
            return res.status(200).json({status: "error",  message:"Deleting Biker failed" }); 
        }
        
    } catch (e) {
        console.log(e);
        return  res.status(500).json({message: e.message})
    }
},



changeBikerStatus: async (req, res) => {
    try {
        
        const { bikerId, isDisabled } = req.body;

        const biker = await Bikers.findById(bikerId)
        if(!biker) return res.status(200).json({status: "error", message: "Biker not found" });

        const result = await Bikers.findOneAndUpdate(
            {_id: bikerId},
            {
                $set: {
                  isDisabled: isDisabled
                },
            },
            {new:true}
            );
        if (result) return res.status(200).json({status: "success", message:"Biker status changed"});

        return res.status(200).json({status: "error",  message:"Changing Biker status failed" }); 
    } catch (e) {
        console.log(e);
        return  res.status(500).json({message: e.message})
    }
},




listBiker: async (req, res) => {
    try {

        var bikers = await Bikers.find();
        if(!bikers) return res.status(200).json({status: "error",  message:"no bikers found"}); 

        return res.status(200).json({
            status: "success", 
            message: 'success', 
            bikers: bikers 
        });
    } 
    catch (e) {
        console.log(e);
        return  res.status(500).json({status: "error", message: e.message})
    }
},

    refreshToken: (req, res) =>{
        try {
            const bikerData = req.bikerData
            
            const accessToken = createAccessToken(bikerData.bikerId)
            const refreshToken = createRefreshToken(biker.bikerId)

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
    return jwt.sign({ bikerId: id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1d"});
}

const createRefreshToken = (id) => {
    return jwt.sign({ bikerId: id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "365d"});
}
function generateBikerId (name) {
    var result           = '';
    var characters       = '0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < 3; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return name.trim().substring(0,6).toUpperCase() + parseInt(Math.random() * (999 - 100) + 100).toString()+ result.toUpperCase();
};
module.exports = bikerController;