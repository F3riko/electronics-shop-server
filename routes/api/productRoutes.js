const express = require("express");
const router = express.Router();
const {
  getProductById,
  getProductImgById,
  getCategories,
  getAllProductsController,
  getProductByCategoryController,
  getProductsSorted,
  getPricesRange,
  searchProductsByQuery,
  getSelectedProductsById,
} = require("../../controllers/productsController");

// root - products
router.get("/img", getProductImgById);
router.get("/category", getProductByCategoryController);
router.get("/categories", getCategories);
router.get("/product", getProductById);
router.post("/selected", getSelectedProductsById);
router.get("/", getAllProductsController);
router.get("/sorted", getProductsSorted);
router.get("/price-range", getPricesRange);
router.get("/search", searchProductsByQuery);

module.exports = router;
