const {
  getProductData,
  getAllProducts,
  getImgByProductId,
  getCategoriesList,
  getProductsByCategory,
} = require("../models/productsModel");
const path = require("path");

async function getAllProductsController(req, res, next) {
  try {
    const products = await getAllProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
}

async function getProductById(req, res, next) {
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
}

async function getProductImgById(req, res, next) {
  try {
    if (!req.query.id) {
      throw new Error("No product id was provided");
    }
    const result = await getImgByProductId(req.query.id);
    if (!result) {
      throw new Error("Img wasn't found");
    } else {
      const fileName = result.img;
      res.setHeader("Cache-Control", "public, max-age=3600");
      res.setHeader("Expires", new Date(Date.now() + 3600000).toUTCString());
      res.sendFile(path.join(__dirname, `../public/images/${fileName}`));
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
}

async function getCategories(req, res, next) {
  try {
    const categories = await getCategoriesList();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
}

async function getProductByCategoryController(req, res, next) {
  try {
    const category = req.query.category;
    const products = await getProductsByCategory(category);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
}

module.exports = {
  getProductById,
  getAllProductsController,
  getProductImgById,
  getCategories,
  getProductByCategoryController,
};
