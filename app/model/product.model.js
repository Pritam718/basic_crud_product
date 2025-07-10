const mongoose = require("mongoose");
const Joi = require("joi");

const productSchemaValidate = Joi.object({
  productName: Joi.string().min(3).max(60).required(),
  productDesc: Joi.string().min(20).max(500).required(),
  price: Joi.number().min(200).max(2000).required(),
  size: Joi.array()
    .items(Joi.string().valid("S", "M", "L", "XL", "XXL"))
    .required(),
  color: Joi.array()
    .items(
      Joi.string().valid("Red", "Green", "Yellow", "Blue", "Black", "White")
    )
    .required(),
  brand: Joi.string().min(3).max(20).required(),
});

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
      unique: true,
    },
    productDesc: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    size: {
      type: [String],
      enum: ["S", "M", "L", "XL", "XXL"],
      required: true,
    },
    color: {
      type: [String],
      enum: ["Red", "Green", "Yellow", "Blue", "Black", "White"],
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    image: {
      type: [String],
      require: true,
    },
    isDeleted: {
      type: Boolean,
      default: true,
    },
    slug: {
      type: String,
      lowercase: true,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
module.exports = { Product, productSchemaValidate };
