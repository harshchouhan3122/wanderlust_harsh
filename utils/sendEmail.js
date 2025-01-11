const { Verification_Email_Template, Welcome_Email_Template } = require("./EmailTemplate.js"); 

const nodemailer = require("nodemailer");

const sendEmail = async (email, username="Dear", otp) => {
    const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: process.env.GMAIL_ID,
            pass: process.env.GMAIL_APP_PASS,        // Use an App Password if you have 2FA enabled
        },
    });

    const mailOptions = {
        from: `"WanderLust_Support" <${process.env.GMAIL_ID}>`,
        to: email,                                                  // list of receivers
        subject: "Verify your Email",                               // Subject line
        text: `Your OTP is: ${otp}`,
        html: Verification_Email_Template.replace("{OTP}",otp).replace("{name}", username)
    };

    await transporter.sendMail(mailOptions);
};

// export const senWelcomeEmail=async(email,name)=>{
//     try {
//      const response=   await transporter.sendMail({
//             from: '"WanderLust_Support" <harshchouhan3121@gmail.com>',

//             to: email, // list of receivers
//             subject: "Welcome Email", // Subject line
//             text: "Welcome Email", // plain text body
//             html: Welcome_Email_Template.replace("{name}",name)
//         })
//         console.log('Email send Successfully',response)
//     } catch (error) {
//         console.log('Email error',error)
//     }
// }

module.exports = sendEmail;
