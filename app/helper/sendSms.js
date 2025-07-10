require("dotenv").config();
const otpVerifyModel = require("../model/otpModel");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = require("twilio")(accountSid, authToken);

const sendSms = async (req, user) => {
  // Generate a random 4 digit otp
  const otp = Math.floor(1000 + Math.random() * 9000);

  // save otp in db
  const gg = await new otpVerifyModel({ userId: user._id, otp: otp }).save();

  let msgOptions = {
    from: process.env.TWILIO_NUMBER,
    to: `+91${user.phone}`,
    body: `Dear ${user.name}
    Thank you for signing up with our website. To complete your registration, Please verify your email address by entering the following one-time password (OTP)
    OTP: ${otp}
    This OTP is valid for 15 minutes. If you didn't request this OTP,please ignore this mesasage.`,
  };
  try {
    const mesasage = await client.messages.create(msgOptions);
    console.log(mesasage);
    return mesasage;
  } catch (error) {
    console.log(error);
  }
};

module.exports = sendSms;
