import { Product } from "../models/product.models.js";
import { asynchandler } from "../utils/asynchandler.js";
import ApiError from "../utils/ApiError.js";
import { uploadCloudnary } from "../utils/cloudnary.js";
import { Apiresponse } from "../utils/Apiresponse.js";
import mongoose from "mongoose";

export const createProduct = asynchandler(async (req, res) => {
  const { name, price, description, rating, category } = req.body;

  // Validate required fields
  if (!name || !price || !description || !category) {
    throw new ApiError(400, "All fields are required");
  }

  // Multer file check
  const productImagePath = req.files?.product_image?.[0]?.path;

  if (!productImagePath) {
    throw new ApiError(400, "Product image is required");
  }

  // Upload to Cloudinary
  const uploadedImage = await uploadCloudnary(productImagePath);

  if (!uploadedImage?.url) {
    throw new ApiError(500, "Product image upload failed");
  }

  // Create product
  const product = await Product.create({
    name,
    price,
    description,
    rating,
    category,
    product_Image: uploadedImage.url,
  });

  return res.status(201).json(
    new Apiresponse(201, product, "Product created successfully")
  );
});


export const getProduct = asynchandler(async (req, res) => {
  const {category}=req.query;
  console.log("category",category)
  let filter={};
  if(category){
    const categoryIds=category.split(',');
    const validIds=categoryIds.filter(id=>mongoose.Types.ObjectId.isValid(id));
    if(validIds.length==0){
      throw new ApiError(400, "Invalid valid Id's ");
    }
    filter.category = { $in: validIds };
  }
  const data = await Product.find(filter)

  if (data.length === 0) {
    throw new ApiError(404, "No Products found");
  }

  return res
    .status(200)
    .json(new Apiresponse(200, data, "Products fetched successfully"));
});
