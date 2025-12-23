import express from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { createProduct, getProduct } from "../controllers/product.controller.js";
const productrouter = express.Router();

productrouter.post(
  "/create_product",
  upload.fields([{ name: "product_image", maxCount: 1 }]),
  createProduct
);

productrouter.get("/get_products",getProduct);

export default productrouter;


