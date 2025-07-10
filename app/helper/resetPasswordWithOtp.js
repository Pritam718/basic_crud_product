const transporter = require("../config/emailConfig");
const otpModel = require("../model/otpModel");
const sendResetPasswordOtp = async (req, user) => {
  const otp = Math.floor(1000 + Math.random() * 9000);

  const otpDetails = await new otpModel({ userId: user._id, otp: otp }).save();
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: "Reset your password",
    html: `<p>Dear ${user.fullName},</p>
    <p>Enter the code below to reset your password </p>
    <h2>OTP: ${otp}</h2>
    <p>This OTP is valid for 15 minutes. If you didn't request this OTP,please ignore this email.</p>`,
  });
  return otp;
};

module.exports = sendResetPasswordOtp;
