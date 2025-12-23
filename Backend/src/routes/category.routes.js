import express from "express";
import { createCategory, getCategory } from "../controllers/category.controller.js";

const categoryRouter = express.Router();

categoryRouter.post("/create_category", createCategory);
categoryRouter.get("/get_category",getCategory);



export default categoryRouter;
