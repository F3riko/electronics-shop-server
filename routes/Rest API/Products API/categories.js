var express = require("express");
var router = express.Router();

const {
  getCategoriesList,
} = require("../../../db-interactions/api-products/api-products-interactions");

router.get("/", async function (req, res, next) {
  try {
    const categories = await getCategoriesList();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});

module.exports = router;
