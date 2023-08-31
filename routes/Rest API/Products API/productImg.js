var express = require("express");
var router = express.Router();
var path = require("path");
var getImgByProductId = require("../../../db-interactions/api-products/api-product-img");

router.get("/", async function (req, res, next) {
  try {
    if (!req.query.id) {
      throw new Error("No product id was provided");
    }
    const result = await getImgByProductId(req.query.id);
    if (!result) {
      throw new Error("Img wasn't found");
    } else {
      const fileName = result.img;
      res.sendFile(path.join(__dirname, `../../../public/images/${fileName}`));
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});

module.exports = router;
