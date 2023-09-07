const express = require("express");
const router = express.Router();
const {
  getProductById,
  getProductImgById,
  getCategories,
  getAllProductsController,
  getProductByCategoryController,
} = require("../../controllers/productsController");

// root - products
router.get("/img", getProductImgById);
router.get("/category", getProductByCategoryController);
router.get("/categories", getCategories);
router.get("/product", getProductById);
router.get("/", getAllProductsController);

module.exports = router;
