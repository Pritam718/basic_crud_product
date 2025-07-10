const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const hashPassword = (password) => {
  try {
    const salt = 10;
    const hashedpassword = bcrypt.hashSync(password, salt);
    return hashedpassword;
  } catch (error) {
    console.log(error);
  }
};
const comparePassword = (password, hashedpassword) => {
  return bcrypt.compare(password, hashedpassword);
};

const Auth = async (req, res, next) => {
  const token =
    req.body?.token ||
    req.query?.token ||
    req.headers["x-access-token"] ||
    req.cookies?.xaccesstoken;

  if (!token) {
    return res.redirect("/api/auth/loginPage");
    // return res.status(400).json({
    //   message: "Token is required for access this page",
    // });
  }
  try {
    const decode = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET_KEY);
    req.user = decode;
  } catch (error) {
    return res.status(400).json({
      message: "Invalid token",
    });
  }
  return next();
};

module.exports = { hashPassword, comparePassword, Auth };
