var express = require("express");
var router = express.Router();
const {
  getAllProducts,
  getProductsByCategory,
} = require("../../../db-interactions/api-products/api-products-interactions");

router.get("/", async function (req, res, next) {
  try {
    const products = await getAllProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/category", async function (req, res, next) {
  try {
    const category = req.query.category;
    const products = await getProductsByCategory(category);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});

module.exports = router;
