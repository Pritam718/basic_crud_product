const mongoose = require("mongoose");
const Joi = require("joi");

const userValidation = Joi.object({
  name: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email({
    minDomainSegments: 2,
    tlds: { allow: ["com", "net"] },
  }),
  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
      reuiqred: true,
    },
    password: {
      type: String,
      required: true,
    },
    is_verified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["user", "admin", "author"],
      default: "user",
    },
    image: {
      type: String,
      reuiqred: true,
    },
  },
  { timestamps: true }
);

const UserModel = mongoose.model("user", userSchema);
module.exports = { UserModel, userValidation };
