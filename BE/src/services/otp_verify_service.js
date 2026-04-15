const nodemailer = require("nodemailer");
const crypto = require("crypto");

const EMAIL_SERVICE = process.env.EMAIL_SERVICE || "gmail";
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_APP_PASSWORD = process.env.EMAIL_APP_PASSWORD;

const buildTransporter = () => {
    if (!EMAIL_USER || !EMAIL_APP_PASSWORD) {
        throw new Error("Missing EMAIL_USER or EMAIL_APP_PASSWORD in environment");
    }

    return nodemailer.createTransport({
        service: EMAIL_SERVICE,
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_APP_PASSWORD,
        },
    });
};

const generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString();
};

const sendOTPEmail = async (recipientEmail, otp) => {
    try {
        const transporter = buildTransporter();
        let mailOptions = {
            from: process.env.EMAIL_FROM || `ScopeTour <${EMAIL_USER}>`,
            to: recipientEmail,
            subject: "Your OTP Code",
            html: `<p>Your OTP code is: <b>${otp}</b></p>`,
        };

        let info = await transporter.sendMail(mailOptions);
        console.log("📩 OTP Email sent: " + info.response);
    } catch (error) {
        console.error("❌ Error sending OTP email:", error);
    }
};

module.exports = { sendOTPEmail, generateOTP };
