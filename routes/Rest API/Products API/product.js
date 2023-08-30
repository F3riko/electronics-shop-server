var express = require("express");
var router = express.Router();
const getProductData = require("../../../db-interactions/api-products/api-product");

router.get("/", async function (req, res, next) {
  try {
    const id = req.query.id;
    if (id !== undefined) {
      const productData = await getProductData(id);
      if (productData) {
        res.json(productData);
      } else {
        res.status(404).json({ error: "Product not found" });
      }
    } else {
      res.status(400).json({ error: "ID not provided" });
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});

module.exports = router;
