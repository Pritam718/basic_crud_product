const express = require("express");
const AuthContorller = require("../controllers/AuthContorller");
const router = express.Router();
const { Auth } = require("../middleware/auth");
const productImageUpload = require("../helper/productImage");

router.get("/registerPage", AuthContorller.registerPage);
router.post(
  "/register",
  productImageUpload.single("image"),
  AuthContorller.register
);
router.get("/verify-otp-form", AuthContorller.verifyOtpForm);
router.post("/verify-otp", AuthContorller.verifyOtp);
router.get("/loginPage", AuthContorller.loginPage);
router.post("/login", AuthContorller.login);
router.post("/reset-password-byOTP", AuthContorller.resetPasswordWithOtp);
router.get(
  "/reset-password-byOTP-form",
  AuthContorller.resetPasswordWithOtpForm
);
router.post("/reset-passwordOTP", AuthContorller.confirmPasswordWithOtp);
router.get(
  "/reset-passwordOTP-form",
  AuthContorller.confirmPasswordWithOtpForm
);

router.use(Auth);
router.get("/profile", AuthContorller.userProfile);
router.get("/editprofile", AuthContorller.userEditPage);
router.post(
  "/userUpdate/:id",
  productImageUpload.single("image"),
  AuthContorller.userEditProfile
);
router.get("/logout", AuthContorller.logout);

module.exports = router;
