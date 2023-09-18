const express = require("express");
const router = express.Router();
const {
  getProductById,
  getProductImgById,
  getCategories,
  getPricesRange,
  getSelectedProductsById,
  getProducts,
  getProductReviews,
} = require("../../controllers/productsController");

// root - products
router.get("/img", getProductImgById);
router.get("/categories", getCategories);
router.get("/product", getProductById);
router.post("/selected", getSelectedProductsById);
router.get("/price-range", getPricesRange);
router.get("/reviews", getProductReviews)
router.get("/", getProducts);

module.exports = router;
