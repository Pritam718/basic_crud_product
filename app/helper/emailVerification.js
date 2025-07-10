const transporter = require("../config/emailConfig");
const otpVerifyModel = require("../model/otpModel");

const sendEmailVerificationOTP = async (req, user) => {
  // Generate a random 4 digit otp
  const otp = Math.floor(1000 + Math.random() * 9000);

  // save otp in db
  const gg = await new otpVerifyModel({ userId: user._id, otp: otp }).save();

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: "OTP- Verify your account",
    html: `<p>Dear ${user.fullName},</p>
    <p>Thank you for signing up with our website. To complete your registration, Please verify your email address by entering the following one-time password (OTP)</p>
    <h2>OTP: ${otp}</h2>
    <p>This OTP is valid for 15 minutes. If you didn't request this OTP,please ignore this email.</p>`,
  });
  return otp;
};

module.exports = sendEmailVerificationOTP;
