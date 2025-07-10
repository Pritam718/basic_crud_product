const { hashPassword, comparePassword } = require("../middleware/auth");
const { UserModel } = require("../model/user.model");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const bucket = require("../config/firebaseconfig");
const sendEmailVerificationOTP = require("../helper/emailVerification");
const EmailVerificationModel = require("../model/otpModel");
const sendResetPasswordOtp = require("../helper/resetPasswordWithOtp");
const sendSms = require("../helper/sendSms");

class AuthController {
  async registerPage(req, res) {
    try {
      res.render("register");
    } catch (error) {
      console.log(error);
    }
  }
  async register(req, res) {
    try {
      const { name, title, email, phone, password, role } = req.body;
      if (!name || !email || !password || !title || !phone) {
        return res.status(404).json({
          message: "All fields are required",
        });
      }
      const existUser = await UserModel.findOne({ email });
      if (existUser) {
        return res.status(400).json({
          message: "user already exits",
        });
      }
      const hashedpassword = await hashPassword(password);
      const user = new UserModel({
        name,
        title,  
        email,
        phone,
        password: hashedpassword,
        role,
      });

      if (req.file) {
        const firebasePath = `products/${Date.now()}_${req.file.originalname}`;
        await bucket.file(firebasePath).save(req.file.buffer, {
          public: true,
          metadata: { contentType: req.file.mimetype },
        });
        const imageUrl = `https://storage.googleapis.com/${bucket.name}/${firebasePath}`;
        user.image = imageUrl;
      }
      const data = await user.save();
      // sendEmailVerificationOTP(req, user);
      sendSms(req, user);
      res.redirect("/api/auth/verify-otp-form");
      // return res.status(201).json({
      //   message: "User created successfully and otp send to your email",
      //   data: userData,
      // });
    } catch (error) {
      console.log(error);
    }
  }
  async verifyOtpForm(req, res) {
    try {
      res.render("otpVerifyForm");
    } catch (error) {
      console.log(error);
    }
  }
  async verifyOtp(req, res) {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        return res
          .status(400)
          .json({ status: false, message: "All fields are required" });
      }
      const existingUser = await UserModel.findOne({ email });
      if (!existingUser) {
        return res.status(404).json({
          status: false,
          message: "Email doesn't exists",
        });
      }

      if (existingUser.is_verified) {
        return res
          .status(400)
          .json({ status: false, message: "Email is already verified" });
      }
      const emailVerification = await EmailVerificationModel.findOne({
        userId: existingUser._id,
        otp,
      });
      if (!emailVerification) {
        if (!existingUser.is_verified) {
          await sendEmailVerificationOTP(req, existingUser);
          return res.status(400).json({
            status: false,
            message: "Invalid OTP, new OTP sent to your email",
          });
        }
        return res.status(400).json({ status: false, message: "Invalid Otp" });
      }
      const currentTime = new Date();
      const expiringTime = new Date(
        emailVerification.createdAt.getTime() + 15 * 60 * 1000
      );
      if (currentTime > expiringTime) {
        await sendEmailVerificationOTP(req, existingUser);
        return res.status(400).json({
          status: false,
          message: "Otp expired, new otp sent to your email",
        });
      }
      existingUser.is_verified = true;
      await existingUser.save();

      await EmailVerificationModel.deleteMany({ userId: existingUser._id });
      // return res
      //   .status(200)
      //   .json({ status: true, message: "Email verified successfully" });
      res.redirect("/api/auth/loginPage");
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: false,
        message: "Unable to verify email, please try again later",
      });
    }
  }
  async loginPage(req, res) {
    try {
      res.render("login");
    } catch (error) {
      console.log(error);
    }
  }
  async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({
          message: "All fields are required",
        });
      }
      const user = await UserModel.findOne({ email });
      if (!user) {
        // return res.status(400).json({
        //   message: "User not found",
        // });
        res.redirect("/api/auth/registerPage");
      }
      if (!user.is_verified) {
        return res.status(401).json({
          status: false,
          message: "Your account is not verified",
        });
      }
      const isMatch = await comparePassword(password, user.password);
      if (!isMatch) {
        return res.status(400).json({
          message: "Invalid credentials",
        });
      }
      const token = jwt.sign(
        {
          user,
        },
        process.env.JWT_ACCESS_TOKEN_SECRET_KEY,
        { expiresIn: "2h" }
      );
      res.cookie("xaccesstoken", token);
      // res.status(200).json({
      //   message: "Login successfull",
      //   token,
      //   user: {
      //     id: user._id,
      //     name: user.name,
      //     email: user.email,
      //   },
      // });
      return res.redirect("/products/");
    } catch (error) {
      console.log(error);
    }
  }
  async userProfile(req, res) {
    try {
      res.render("user", { data: req.user.user });
      // return res
      //   .status(200)
      //   .json({ message: "User profile accessed", data: req.user });
    } catch (error) {
      console.log(error);
    }
  }
  async userEditPage(req, res) {
    try {
      res.render("userEdit", { data: req.user.user });
    } catch (error) {
      console.log(error);
    }
  }
  async userEditProfile(req, res) {
    try {
      const id = req.params.id;
      const data = await UserModel.findById(id);
      if (!data) {
        res.status(404).json({ message: "User not found" });
      }
      const { name, title, email, phone, password } = req.body;
      const hashedpassword = await hashPassword(password);

      let updateImage = data.image;
      if (req.file) {
        const fullImagePath = path.join(__dirname, "../../", data.image);
        fs.unlink(fullImagePath, (err) => {
          if (err) {
            console.log("image update failed", err);
          }
        });
        updateImage = req.file.path;
      }

      const updateuser = await UserModel.findByIdAndUpdate(id, {
        name,
        title,
        email,
        phone,
        password: hashedpassword,
        image: updateImage,
      });
      // res.status(200).json({
      //   message: "Update Successfully",
      // });
      return res.redirect("/api/auth/loginPage");
    } catch (error) {
      console.log(error);
    }
  }
  async resetPasswordWithOtpForm(req, res) {
    try {
      res.render("forgotPassEmail");
    } catch (error) {
      console.log(error);
    }
  }
  async resetPasswordWithOtp(req, res) {
    try {
      const { email } = req.body;
      if (!email) {
        return res
          .status(404)
          .json({ status: false, message: "Email Is required" });
      }
      const user = await UserModel.findOne({ email });

      if (!user) {
        return res
          .status(400)
          .json({ status: false, message: "Email doesn't exist" });
      }
      sendResetPasswordOtp(req, user);
      res.redirect("/api/auth/reset-passwordOTP-form");
      // return res.status(200).json({
      //   status: true,
      //   message: "Otp send your mail for reset your password",
      // });
    } catch (error) {
      console.log(error);
    }
  }
  async confirmPasswordWithOtpForm(req, res) {
    try {
      res.render("forgotPassVerify");
    } catch (error) {
      console.log(error);
    }
  }
  async confirmPasswordWithOtp(req, res) {
    try {
      const { email, otp, newPassword, confirm_password } = req.body;
      if (!email || !otp || !newPassword || !confirm_password) {
        return res.status(400).json({
          status: false,
          message: "Otp , New Password and confirm new password are required",
        });
      }
      if (newPassword !== confirm_password) {
        return res.status(400).json({
          satus: false,
          message: "New password and confirm password don't match",
        });
      }
      const existingUser = await UserModel.findOne({ email });
      if (!existingUser) {
        return res.status(404).json({
          status: false,
          message: "Email doesn't exists",
        });
      }
      const otpVerification = await EmailVerificationModel.findOne({
        userId: existingUser._id,
        otp,
      });
      if (!otpVerification) {
        await sendResetPasswordOtp(req, existingUser);
        return res.status(400).json({ status: false, message: "Invalid Otp" });
      }
      const currentTime = new Date();
      const expiringTime = new Date(
        otpVerification.createdAt.getTime() + 15 * 60 * 1000
      );
      if (currentTime > expiringTime) {
        await sendResetPasswordOtp(req, existingUser);
        return res.status(400).json({
          status: false,
          message: "Otp expired, new otp sent to your email",
        });
      }
      await EmailVerificationModel.deleteMany({ userId: existingUser._id });
      const newhashPassword = await hashPassword(newPassword);
      await UserModel.findByIdAndUpdate(existingUser._id, {
        $set: { password: newhashPassword },
      });
      res.redirect("/api/auth/loginPage");
      // res
      //   .status(200)
      //   .json({ status: true, message: "Password reset successfully" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: false,
        message: "Failed to reset password. Please try again later",
      });
    }
  }
  async logout(req, res) {
    try {
      res.clearCookie("xaccesstoken");
      return res.redirect("/api/auth/loginPage");
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = new AuthController();
