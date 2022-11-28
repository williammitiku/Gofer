const { Users } = require('../model/user')
const jwt = require("jsonwebtoken");
const emailController = require('../helper/emailController')
const { json } = require('body-parser');
// const bcrypt = require("bcryptjs");

const userController = {
   
    createUser: async (req, res) => {
        try {

            const { user, secretKey } =req.body;
            
            if(secretKey !== process.env.USER_TOKEN_SECRET) {
                return res.status(200).send({
                    status: "error",
                    message: "incorrect secret key"
                });
            }

            var newUser = await Users.create(user)
            if(!newUser) return res.status(200).json({status: "error",  message:"user registration failed", user: user }); 
            
            delete newUser.password;

            const token = createAccessToken(newUser._id)
            const refreshToken = createRefreshToken(newUser._id)

            return res.status(200).json({
                status: "success", 
                message: `User registered succcessfully`, 
                user: newUser,
                token, 
                refreshToken
            });
                
        } catch (e) {
            console.log(e);
            return  res.status(500).json({message: e.message})
        }
    },

    refreshToken: (req, res) =>{
        try {
            const user = req.user
            
            const accessToken = createAccessToken(user.userId)
            const refreshToken = createRefreshToken(user.userId)

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

    getToken: async (req, res) => {
        const { phoneNumber, secretKey } = req.body;     

        try{
            if(secretKey !== process.env.USER_TOKEN_SECRET) {
                return res.status(200).send({
                    status: "error",
                    message: "incorrect secret key"
                });
            }

            const userData = await Users.findOne({ phoneNumber: phoneNumber }).exec();
            if (!userData) {
               return res.status(200).send({ 
                    status: "error",
                    message: "user does not exists"
               });
            }

            const token = createAccessToken(userData._id)
            const refreshToken = createRefreshToken(userData._id)

            return res.status(200).json({status: "success", user: userData, token, refreshToken });
            
         } catch (err) {
            return res.status(500).send({status: "error", err});
         }
    },
    getUsers: async (req, res) => {
        try {

            var foods = await Users.findAll();
            if(!foods) return res.status(200).json({status: "error",  message:"no User found"}); 
    
            return res.status(200).json({
                status: "success", 
                message: 'success', 
                foods: foods 
            });
        } 
        catch (e) {
            console.log(e);
            return  res.status(500).json({status: "error", message: e.message})
        }
    },

    forgetPassword: async (req, res) => {
        try {
            const {email}  = req.body

            var user = await Users.findOne({email: email})
            if(!user) return res.status(200).json({status: "error",  message:"User not found" }); 
            
            await user.generateVerificationToken(async (verificationCode, defaultPassword) => {
                if(!defaultPassword) return res.status(200).json({status: "error", message: "operation failed. couldn't generate reset key"})

                user.password = defaultPassword;
                user.save();

                emailController.sendForgetPasswordEmail(email, defaultPassword);

                delete user.password;
    
                return res.status(200).json({
                    status: "success", 
                    message: `A new password reset key is sent via email to ${user.email}`, 
                    user 
                });
                
            });

        } catch (e) {
            console.log(e);
            return  res.status(500).json({message: e.message})
        }
    },

    update: async (req, res) => {
        try {
            const user  = req.user;
          
            const { 
                userId,
                firstName,
                middleName,
                lastName,
                profileImage,
                phoneNumber,
                oldPassword,
                newPassword
            } = req.body;
            const userData = await Users.findById({_id: user.userId})

            if(!userData){
                return res.status(200).json({status: "error", message: 'user not found'})
            }
            
            // if(profileImage) {
            //     var newImage = imageConverter.convert([profileImage]);
            //     profileImage = newImage[0];
            // }

            const filter = (userId) ? {_id: userId} : {_id: user.userId}

            if(oldPassword && newPassword) {
                
                await userData.comparePassword(oldPassword, async (matchError, isMatch) => {
                    if (matchError) 
                        return res.status(200).json({status: "error", message: "something went wrong" });
                    
                    if (!isMatch) 
                        return res.status(400).json({status: "error", message: 'old password incorrect'})

                        userData.encryptPassword(newPassword, async (saltError, hash) => {
                            if (saltError) {
                                return res.status(200).json({status: "error", message: "something went wrong", saltError });
                            }
                            if (!hash) {
                                return res.status(200).json({status: "error", message: "Can't encrypt password" });
                            }

                            const userData = await Users.findOneAndUpdate(
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
                            
                            await userData.save();
    
                            if(userData) return res.status(200).json({status: "success", message: "User data updated successfully", data: userData});
                            else return res.status(200).json({status: "error", message: "User data updated failed", data: userData});

                        });
                          
                });
            }
            else {
                const userData = await Users.findOneAndUpdate(
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
                
                await userData.save();

                if(userData) return res.status(200).json({status: "error", message: "User data updated successfully", data: userData});
                else return res.status(200).json({status: "error", message: "User data updated failed", data: userData});
            }


        } catch (e) {
            console.log(e);
            return  res.status(500).json({message: e.message})
        }
    },

    changeUserStatus: async (req, res) => {
        try {
            const { userId, isDisabled } = req.body;

            const user = await Users.findById(userId)
            if(!user) return res.status(200).json({status: "error", message: "user not found" });

            const result = await Users.findOneAndUpdate(
                {_id: userId},
                {
                    $set: {
                      isDisabled: isDisabled
                    },
                },
                {new:true}
                );
            if (result) return res.status(200).json({status: "success", message:"user status changed"});

            return res.status(200).json({status: "error",  message:"changing user status failed" }); 
        } catch (e) {
            console.log(e);
            return  res.status(500).json({message: e.message})
        }
    },

    listUsers: async (req, res) => {
        try {
            const users = await Users.find()
            
            if(!users) return res.status(200).json({status: "error", message: "no users found" });

            return res.status(200).json({status: "success",  message: "success", users: users });

        } catch (e) {
            console.log(e);
            return  res.status(500).json({status: "error", message: e.message})
        }
    },

}

const createAccessToken = (id) =>{
    return jwt.sign({ userId: id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1d"});
}

const createRefreshToken = (id) => {
    return jwt.sign({ userId: id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "365d"});
}

module.exports = userController;