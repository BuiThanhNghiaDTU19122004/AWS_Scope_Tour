const nodemailer = require("nodemailer");

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

const sendInvitationEmail = async (host, recipientEmail, inviteLink) => {
    try {
        const transporter = buildTransporter();
        const fromAddress = process.env.EMAIL_FROM || `ScopeTour <${EMAIL_USER}>`;

        const mailOptions = {
            from: fromAddress,
            to: recipientEmail,
            subject: "You're Invited!",
            html: `
                <h2>Hello!</h2>
                <p>You have been invited to join our website. Click the button below to join:</p>
                <a href="${inviteLink}" style="display:inline-block; padding:10px 20px; color:white; background-color:blue; text-decoration:none; border-radius:5px;">
                    Join Now
                </a>
                <p>If the button doesn't work, copy and paste this link into your browser:</p>
                <p>${inviteLink}</p>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent: " + info.response);
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

module.exports = sendInvitationEmail;
