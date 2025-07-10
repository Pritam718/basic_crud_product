const { Product, productSchemaValidate } = require("../model/product.model");
const path = require("path");
const fs = require("fs");
const slugify = require("slugify");

class ApiProductController {
  async getProduct(req, res) {
    try {
      const data = await Product.find();
      if (data.length === 0) {
        res.status(404).json({
          message: "Data not found",
        });
      } else {
        res.status(200).json({
          message: "Product fetch successfully",
          data: data,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: "Product Fetch failed",
        error,
      });
    }
  }

  async getSpecificProduct(req, res) {
    try {
      const id = req.params.id;
      const data = await Product.findById(id);
      if (data === null) {
        res.status(404).json({
          message: "Data not found",
        });
      } else {
        res.status(200).json({
          message: "Product fetch successfully",
          data: data,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: "Specific Product fetch failed",
      });
    }
  }

  async search(req, res) {
    try {
      const { brand, color, size, minPrice, maxPrice } = req.query;

      const queryObj = {};
      if (brand) {
        // queryObj.brand = { $regex: brand, $options: "i" };
        queryObj.brand = { $in: brand };
      }
      if (size) {
        queryObj.size = { $in: size };
      }
      if (color) {
        queryObj.color = { $in: color };
      }
      if (minPrice || maxPrice) {
        queryObj.price = {};

        if (minPrice) {
          queryObj.price.$gte = parseFloat(minPrice);
        }

        if (maxPrice) {
          queryObj.price.$lte = parseFloat(maxPrice);
        }
      }

      const data = await Product.find(queryObj);

      if (data.length === 0) {
        res.status(200).json({
          message: "Data Not found",
          data: data,
        });
      } else {
        res.status(200).json({
          message: "Search success",
          data: data,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: "Search failed",
      });
    }
  }

  async createProduct(req, res) {
    try {
      const dataBody = {
        productName: req.body.productName,
        productDesc: req.body.productDesc,
        price: req.body.price,
        size: req.body.size,
        color: req.body.color,
        brand: req.body.brand,
      };
      // validation
      const { error, value } = productSchemaValidate.validate(dataBody);

      if (error) {
        return res.status(401).json({
          message: error.details[0].message,
        });
      } else {
        const productData = new Product(value);
        if (req.files) {
          const imagePaths = req.files.map((file) => file.path);
          productData.image = imagePaths;
        }
        const data = await productData.save();
        return res.status(201).json({
          message: "student created successfully",
          data: data,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: "Product create Failed",
        error,
      });
    }
  }
  async editProduct(req, res) {
    try {
      const id = req.params.id;
      const editData = await Product.findById(id);

      if (editData) {
        res.status(200).json({
          message: "Edit Fetch",
          data: editData,
        });
      } else {
        return res.status(404).json({ message: "Product not found" });
      }
    } catch (error) {
      res.status(500).json({
        message: "Edit failed",
        error,
      });
    }
  }
  async updateProduct(req, res) {
    try {
      const id = req.params.id;
      const existingProduct = await Product.findById(id);
      if (!existingProduct) {
        return res.status(404).json({ message: "Product not found" });
      }

      let updatedImagePaths = existingProduct.image;
      if (req.files && req.files.length > 0) {
        existingProduct.image.map((img) => {
          const imageFullPath = path.join(__dirname, "../../", img);
          fs.unlink(imageFullPath, (err) => {
            if (err) console.error("Failed to delete image:", err);
          });
        });

        updatedImagePaths = req.files.map((file) => file.path);
      }

      const { productName, productDesc, price, size, color, brand } = req.body;
      const data = {
        productName,
        productDesc,
        price,
        size,
        color,
        brand,
      };
      const { error, value } = productSchemaValidate.validate(data);
      if (error) {
        return res.status(401).json({
          message: error.details[0].message,
        });
      } else {
        const updateData = await Product.findByIdAndUpdate(
          id,
          {
            productName,
            productDesc,
            price,
            size,
            color,
            brand,
            image: updatedImagePaths,
          },
          { new: true }
        );
        if (!updateData) {
          return res.status(404).json({ message: "Product not found" });
        }
        return res.status(200).json({
          message: "Update Successfully",
        });
      }
    } catch (error) {
      res.status(500).json({
        message: "update failed",
        error,
      });
    }
  }
  async deleteProduct(req, res) {
    try {
      const id = req.params.id;
      const deleteData = await Product.findById(id);
      if (!deleteData) {
        return res.status(404).json({ message: "Product not found" });
      }
      // if (deleteData.image) {
      //   deleteData.image.map((img) => {
      //     const imageFullPath = path.join(__dirname, "../../", img);
      //     fs.unlink(imageFullPath, (err) => {
      //       if (err) console.error("Failed to delete image:", err);
      //     });
      //   });
      // }
      const updateData = await Product.findByIdAndUpdate(id, {
        isDeleted: false,
      });
      // console.log(updateData);
      res.status(200).json({
        message: "Delete Successfully",
      });
    } catch (error) {
      res.status(500).json({
        message: "Delete failed",
        error,
      });
    }
  }
  async createBySlug(req, res) {
    try {
      const { productName, productDesc, price, size, color, brand } = req.body;
      const product = new Product({
        productName,
        productDesc,
        price,
        size,
        color,
        brand,
        slug: slugify(productName),
      });
      const data = await product.save();
      return res.status(200).json({ message: "Product add", data: data });
    } catch (error) {
      console.log(error);
    }
  }
  async getBySlug(req, res) {
    try {
      const slug = req.params.slug;
      const data = await Product.find({ slug });
      return res.status(200).json({ message: "Data fetch", data: data });
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = new ApiProductController();
