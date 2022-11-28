const { Admins, Admin } = require('../model/admin')
const jwt = require("jsonwebtoken");
const emailController = require('../helper/emailController')
const { json } = require('body-parser');
// const bcrypt = require("bcryptjs");

const adminController = {
   
    login: async (req, res) => {
        const { email, password, deviceId } = req.body;
        
        try {
            var adminData = await Admins.findOne({ email: email });
            if (!adminData) {
              return res.status(200).json({status: "error", message: "Driver not found" });
            }

            adminData.comparePassword(password, async (matchError, isMatch) => {
              if (matchError) {
                  return res.status(200).json({status: "error", message: "something went wrong" });
              }
              if (!isMatch) {
                  return res.status(200).json({status: "error", message: "Incorrect password" });
              }

               
              const token = createAccessToken(adminData._id)
              const refreshToken = createRefreshToken(adminData._id)
              console.info(token);
  
              return res.status(200).json({status: "success", admin: adminData, token, refreshToken });

            });
        } catch (e) {
            return  res.status(200).json({status: "error", message: e.message})
        }
    },
    createAdmin: async (req, res) => {
        try {
            const  admin =req.body;
   
            const existingDriver = await Admins.findOne({
                email: admin.email,
              });
              if (existingDriver) {
                return res.status(200).json({status: "error", message: "Driver already exists" });
              }

            admin.role = 1; //Driver access

            // var imageUrls = imageConverter.convert([user.profileImage]);
            
            // if (!imageUrls) {
            //     return res.status(200).json({status: "error", message: "unable to save images" });
            // }

            // user.profileImage = imageUrls[0];

            var newAdmin = await Admins.create(admin)
            if(!newAdmin) return res.status(200).json({status: "error",  message:"admin registration failed", admin: admin }); 
            
            await newAdmin.generateVerificationToken(async (verificationCode, defaultPassword) => {
                if(!verificationCode || !defaultPassword) return res.status(200).json({status: "error", message: "operation failed. couldn't generate verification code"})

                emailController.sendVerificationEmail(admin.email, verificationCode, defaultPassword);

            
                 admin.role = 1; 
    
                return res.status(200).json({
                    status: "success", 
                    message: `Admin registered. A verification email is send to ${admin.email}`, 
                    admin: admin 
                });              
            });
        } catch (e) {
            console.log(e);
            return  res.status(500).json({message: e.message})
        }
    },

    createRestaurantAdmin: async (req, res) => {
        try {
            const admin =req.body;
         
            const existingDriver = await Admins.findOne({
                email: admin.email,
              });
              if (existingDriver) {
                return res.status(200).json({status: "error", message: "Restaurant already exists" });
              }

            admin.role = 0; //Driver access

            // var imageUrls = imageConverter.convert([user.profileImage]);
            
            // if (!imageUrls) {
            //     return res.status(200).json({status: "error", message: "unable to save images" });
            // }

            // user.profileImage = imageUrls[0];

            var newAdmin = await Admins.create(admin)
            if(!newAdmin) return res.status(200).json({status: "error",  message:"admin registration failed", admin: admin }); 
            
            await newAdmin.generateVerificationToken(async (verificationCode, defaultPassword) => {
                if(!verificationCode || !defaultPassword) return res.status(200).json({status: "error", message: "operation failed. couldn't generate verification code"})

                emailController.sendVerificationEmail(admin.email, verificationCode, defaultPassword);

                delete admin.password;
                delete admin.role;
    
                return res.status(200).json({
                    status: "success", 
                    message: `Admin registered. A verification email is send to ${admin.email}`, 
                    admin: admin 
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
            const admin = await Admins.findOne({ verificationCode: verificationCode }).exec();
            if (!admin) {
               return res.status(200).send({ 
                    status: "error",
                    message: "admin does not  exists",
                    defaultPassword: admin.password 
               });
            }

            // Step 3 - Update Driver verification status to true
            admin.isVerified = true;
            await admin.save();
            
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

            var admin = await Admins.findOne({email: email})
            if(!admin) return res.status(200).json({status: "error",  message:"admin not found" }); 
            
            await admin.generateVerificationToken(async (verificationCode, defaultPassword) => {
                if(!defaultPassword) return res.status(200).json({status: "error", message: "operation failed. couldn't generate reset key"})

                admin.password = defaultPassword;
                admin.save();

                emailController.sendForgetPasswordEmail(email, defaultPassword);

                delete admin.password;
                delete admin.role;
    
                return res.status(200).json({
                    status: "success", 
                    message: `A new password reset key is sent via email to ${admin.email}`, 
                    admin 
                });
                
            });

        } catch (e) {
            console.log(e);
            return  res.status(500).json({message: e.message})
        }
    },
    

    update: async (req, res) => {
        try {
            const admin  = req.admin;
          
            const { 
                adminId,
                firstName,
                middleName,
                lastName,
                profileImage,
                phoneNumber,
                oldPassword,
                newPassword
            } = req.body;
            const adminData = await Admins.findById({_id: admin.adminId})

            if(!adminData){
                return res.status(200).json({status: "error", message: 'user not found'})
            }
            
            // if(profileImage) {
            //     var newImage = imageConverter.convert([profileImage]);
            //     profileImage = newImage[0];
            // }

            const filter = (adminData.role === 1 && adminId) ? {_id: adminId} : {_id: admin.adminId}

            if(oldPassword && newPassword) {
                
                await adminData.comparePassword(oldPassword, async (matchError, isMatch) => {
                    if (matchError) 
                        return res.status(200).json({status: "error", message: "something went wrong" });
                    
                    if (!isMatch) 
                        return res.status(400).json({status: "error", message: 'old password incorrect'})

                        adminData.encryptPassword(newPassword, async (saltError, hash) => {
                            if (saltError) {
                                return res.status(200).json({status: "error", message: "something went wrong", saltError });
                            }
                            if (!hash) {
                                return res.status(200).json({status: "error", message: "Can't encrypt password" });
                            }

                            const adminData = await Admins.findOneAndUpdate(
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
                            
                            await adminData.save();
    
                            if(adminData) return res.status(200).json({status: "success", message: "User data updated successfully", data: adminData});
                            else return res.status(200).json({status: "error", message: "User data updated failed", data: adminData});

                        });
                          
                });
            }
            else {
                const adminData = await Admins.findOneAndUpdate(
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
                
                await adminData.save();

                if(adminData) return res.status(200).json({status: "error", message: "User data updated successfully", data: adminData});
                else return res.status(200).json({status: "error", message: "User data updated failed", data: adminData});
            }


        } catch (e) {
            console.log(e);
            return  res.status(500).json({message: e.message})
        }
    },


    

    listAllAdmin: async (req, res) => {
    try {

        var admins = await Admins.find();
        if(!admins) return res.status(200).json({status: "error",  message:"no Admins found"}); 

        return res.status(200).json({
            status: "success", 
            message: 'success', 
            admins: admins 
        });
    } 
    catch (e) {
        console.log(e);
        return  res.status(500).json({status: "error", message: e.message})
    }
},

listAdmin: async (req, res) => {
    try {

        var admins = await Admins.find({role: "1"});
        if(!admins) return res.status(200).json({status: "error",  message:"no Admins found"}); 

        return res.status(200).json({
            status: "success", 
            message: 'success', 
            admins: admins 
        });
    } 
    catch (e) {
        console.log(e);
        return  res.status(500).json({status: "error", message: e.message})
    }
},


ListRestaurantAdmin: async (req, res) => {
    try {

        var admins = await Admins.find({role: "0"});
        if(!admins) return res.status(200).json({status: "error",  message:"no Admins found"}); 

        return res.status(200).json({
            status: "success", 
            message: 'success', 
            admins: admins 
        });
    } 
    catch (e) {
        console.log(e);
        return  res.status(500).json({status: "error", message: e.message})
    }
},



    changeAdminStatus: async (req, res) => {
        try {
            
            const { adminId, isDisabled } = req.body;
    
            const admin = await Admins.findById(adminId)
            if(!admin) return res.status(200).json({status: "error", message: "Admin not found" });
    
            const result = await Admins.findOneAndUpdate(
                {_id: adminId},
                {
                    $set: {
                      isDisabled: isDisabled
                    },
                },
                {new:true}
                );
            if (result) return res.status(200).json({status: "success", message:"Admin status changed"});
    
            return res.status(200).json({status: "error",  message:"Changing Admin status failed" }); 
        } catch (e) {
            console.log(e);
            return  res.status(500).json({message: e.message})
        }
    },
    
    
    
    

}
const createAccessToken = (id) =>{
    console.info(id)
    return jwt.sign({ adminId: id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1d"});
}

const createRefreshToken = (id) => {
    return jwt.sign({ adminId: id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "365d"});
}

module.exports = adminController;