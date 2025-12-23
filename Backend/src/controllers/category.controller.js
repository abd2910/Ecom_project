import { Category } from "../models/category.models.js";
import { asynchandler } from "../utils/asynchandler.js";
import ApiError from "../utils/ApiError.js";
import { Apiresponse } from "../utils/Apiresponse.js";

export const createCategory = asynchandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    throw new ApiError(400, "Category name is required");
  }

  const category = await Category.create({ name });

  return res
    .status(201)
    .json(new Apiresponse(201, category, "Category created successfully"));
});

export const getCategory = asynchandler(async (req, res) => {
  const data = await Category.find();

  if (data.length === 0) {
    throw new ApiError(404, "No categories found");
  }

  return res
    .status(200)
    .json(new Apiresponse(200, data, "Categories fetched successfully"));
});

