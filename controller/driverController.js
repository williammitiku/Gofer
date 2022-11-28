const { Drivers } = require('../model/driver')
const jwt = require("jsonwebtoken");
const emailController = require('../helper/emailController')
const { json } = require('body-parser');
//const clearCache = require("../services/cache");

const driverController = {
   
    login: async (req, res) => {
        const { phoneNumber, password, deviceId } = req.body;
        
        try {
            var driverData = await Drivers.findOne({ phoneNumber: phoneNumber });
            if (!driverData) {
              return res.status(200).json({status: "error", message: "Driver not found" });
            }

            driverData.comparePassword(password, async (matchError, isMatch) => {
              if (matchError) {
                  return res.status(200).json({status: "error", message: "something went wrong" });
              }
              if (!isMatch) {
                  return res.status(200).json({status: "error", message: "Incorrect password" });
              }

              if(driverData.role !== 0) {
                driverData.deviceId = deviceId;
                driverData.save();
              }
              
              const token = createAccessToken(driverData._id)
              const refreshToken = createRefreshToken(driverData._id)
  
              return res.status(200).json({status: "success", driver: driverData, token, refreshToken });

            });
        } catch (e) {
            return  res.status(200).json({status: "error", message: e.message})
        }
    },

    createDriver: async (req, res) => {
        try {
            const driver =req.body;
           // var driver2 = generateDriverId('Driver');
           // driver.driverId=driver2;
            const existingDriver = await Drivers.findOne({
                email: driver.email,
              });
              if (existingDriver) {
                return res.status(200).json({status: "error", message: "Driver already exists" });
              }

            driver.role = 0; //Driver access

            // var imageUrls = imageConverter.convert([user.profileImage]);
            
            // if (!imageUrls) {
            //     return res.status(200).json({status: "error", message: "unable to save images" });
            // }

            // user.profileImage = imageUrls[0];

            var newDriver = await Drivers.create(driver)
            if(!newDriver) return res.status(200).json({status: "error",  message:"Driver registration failed", driver: driver }); 
            
           // clearCache(Drivers.collection.collectionName);

            await newDriver.generateVerificationToken(async (verificationCode, defaultPassword) => {
                if(!verificationCode || !defaultPassword) return res.status(200).json({status: "error", message: "operation failed. couldn't generate verification code"})

                emailController.sendVerificationEmail(driver.email, verificationCode, defaultPassword);

                delete driver.password;
                delete driver.role;
    
                return res.status(200).json({
                    status: "success", 
                    message: `Driver registered. A verification email is send to ${driver.email}`, 
                    driver: driver 
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
            // Step 2 - Find Driver with matching ID
            const driver = await Drivers.findOne({ verificationCode: verificationCode }).exec();
            if (!driver) {
               return res.status(200).send({ 
                    status: "error",
                    message: "Driver does not  exists",
                    defaultPassword: driver.password 
               });
            }

            // Step 3 - Update Driver verification status to true
            driver.isVerified = true;
            await driver.save();
            
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

            var driver = await Drivers.findOne({email: email})
            if(!driver) return res.status(200).json({status: "error",  message:"Driver not found" }); 
            
            await driver.generateVerificationToken(async (verificationCode, defaultPassword) => {
                if(!defaultPassword) return res.status(200).json({status: "error", message: "operation failed. couldn't generate reset key"})

                driver.password = defaultPassword;
                driver.save();

                emailController.sendForgetPasswordEmail(email, defaultPassword);

                delete driver.password;
                delete driver.role;
    
                return res.status(200).json({
                    status: "success", 
                    message: `A new password reset key is sent via email to ${driver.email}`, 
                    driver 
                });
                
            });

        } catch (e) {
            console.log(e);
            return  res.status(500).json({message: e.message})
        }
    },

    update: async (req, res) => {
        try {
            const driver  = req.driver;
          
            const { 
                driverId,
                firstName,
                middleName,
                lastName,
                profileImage,
                phoneNumber,
                oldPassword,
                newPassword
            } = req.body;
            const driverData = await Drivers.findById({_id: driver.driverId})

            if(!driverData){
                return res.status(200).json({status: "error", message: 'user not found'})
            }
            
           // clearCache(Drivers.collection.collectionName);

            // if(profileImage) {
            //     var newImage = imageConverter.convert([profileImage]);
            //     profileImage = newImage[0];
            // }

            const filter = (driverData.role === 1 && driverId) ? {_id: driverId} : {_id: driver.driverId}

            if(oldPassword && newPassword) {
                
                await driverData.comparePassword(oldPassword, async (matchError, isMatch) => {
                    if (matchError) 
                        return res.status(200).json({status: "error", message: "something went wrong" });
                    
                    if (!isMatch) 
                        return res.status(400).json({status: "error", message: 'old password incorrect'})

                        driverData.encryptPassword(newPassword, async (saltError, hash) => {
                            if (saltError) {
                                return res.status(200).json({status: "error", message: "something went wrong", saltError });
                            }
                            if (!hash) {
                                return res.status(200).json({status: "error", message: "Can't encrypt password" });
                            }

                            const driverData = await Drivers.findOneAndUpdate(
                                filter,
                                    {
                                        $set: {
                                            firstName,
                                            middleName,
                                            lastName,
                                            profileImage,
                                            phoneNumber,
                                            password: hash
                                        },
                                    },
                                    {new:true}
                            ).select('-password');
                            
                            await driverData.save();
    
                            if(driverData) return res.status(200).json({status: "success", message: "User data updated successfully", data: driverData});
                            else return res.status(200).json({status: "error", message: "User data updated failed", data: driverData});

                        });
                          
                });
            }
            else {
                const driverData = await Drivers.findOneAndUpdate(
                    filter,
                        {
                            $set: {
                                firstName,
                                middleName,
                                lastName,
                                profileImage,
                                phoneNumber,
                            },
                        },
                        {new:true}
                ).select('-password');
                
                await driverData.save();

                if(driverData) return res.status(200).json({status: "error", message: "User data updated successfully", data: driverData});
                else return res.status(200).json({status: "error", message: "User data updated failed", data: driverData});
            }


        } catch (e) {
            console.log(e);
            return  res.status(500).json({message: e.message})
        }
    },

    deleteDriver: async (req, res) => {
        try {
            const { email } =req.body;

            const driver = await Drivers.findOne({email: email});
            
            if (!driver) {
                return res.status(200).json({status: "error", message: "Driver not found" });
            }

            const result = await Drivers.deleteOne({email: email})
            
           // clearCache(Drivers.collection.collectionName);

            if (result.deletedCount === 1) {
                return res.status(200).json({status: "success", message:"Driver deleted" });
            } else {
                return res.status(200).json({status: "error",  message:"Deleting Driver failed" }); 
            }
            
        } catch (e) {
            console.log(e);
            return  res.status(500).json({message: e.message})
        }
    },

    changeDriverStatus: async (req, res) => {
        try {
            
            const { driverId, isDisabled } = req.body;

            const driver = await Drivers.findById(driverId)
            if(!driver) return res.status(200).json({status: "error", message: "Driver not found" });

            const result = await Drivers.findOneAndUpdate(
                {_id: driverId},
                {
                    $set: {
                    isDisabled: isDisabled
                    },
                },
                {new:true}
                );

           // clearCache(Drivers.collection.collectionName);
            if (result) return res.status(200).json({status: "success", message:"Driver status changed"});

            return res.status(200).json({status: "error",  message:"Changing Driver status failed" }); 
        } catch (e) {
            console.log(e);
            return  res.status(500).json({message: e.message})
        }
    },

    listDrivers: async (req, res) => {
        try {

            //var drivers = await Drivers.find().cache();
            var drivers = await Drivers.find();
            if(!drivers) return res.status(200).json({status: "error",  message:"no Driver found"}); 

            return res.status(200).json({
                status: "success", 
                message: 'success', 
                drivers: drivers 
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
module.exports = driverController;