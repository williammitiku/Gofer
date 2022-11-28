const nodemailer = require('nodemailer');

const emailTransporter = nodemailer.createTransport({
    // service: "Gmail",
    // auth: {
    //    user: process.env.EMAIL_USERNAME,
    //    pass: process.env.EMAIL_PASSWORD,
    // },
  
    host: 'mail.rctafrica.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
    }
  
  });

const emailController = {
    async sendVerificationEmail(email, code, password) {
        try {
    
            await emailTransporter.sendMail({
                from: process.env.EMAIL_USERNAME,
                to: email,
                subject: 'All In One Account Verify',
                html: `Welcome to All In One Application<br>
                        You can use the following credentials to verify your account<br>
                        Verification Code: ${code}<br>`
            })
        }
        catch (e) {
            console.log(e);
            return  res.status(500).json({message: e.message})
        }
    },
    
    async sendForgetPasswordEmail(email, password) {
        try {
    
            await emailTransporter.sendMail({
                from: process.env.EMAIL_USERNAME,
                to: email,
                subject: 'All In One Account Verify',
                html: `Welcome to All In One Application<br>
                        You can reset your password using the following reset key<br>
                        Reset Key: ${password}<br>`
            })
        }
        catch (e) {
            console.log(e);
            return  res.status(500).json({message: e.message})
        }
    }
}
  
module.exports =  emailController