import express from "express";

import { getAllProducts, getFeaturedProducts, getProductsByCategory, getRecommendedProducts,
    createProduct, deleteProduct, toggleFeaturedProduct } from "../controllers/product.controller.js";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, adminRoute, getAllProducts)
router.post("/", protectRoute, adminRoute, createProduct);
router.delete("/:id", protectRoute, adminRoute, deleteProduct);
router.patch("/:id", protectRoute, adminRoute, toggleFeaturedProduct);
router.get("/featured", getFeaturedProducts);
router.get("/recommendations", getRecommendedProducts);
router.get("/category/:category", getProductsByCategory);

export default router;