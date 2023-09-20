const {
  getProductData,
  getImgByProductId,
  getCategoriesList,
  getMinMaxPricesByCategory,
  getSelectedProductsByIdSQL,
  getProductsSQL,
  getProductReviewsSQL,
  getSpecsObjSQL,
} = require("../models/productsModel");
const path = require("path");

const getProducts = async (req, res) => {
  try {
    const products = await getProductsSQL(req.query);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};

const getProductById = async (req, res) => {
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
};

const getProductImgById = async (req, res) => {
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
};

const getCategories = async (req, res) => {
  try {
    const categories = await getCategoriesList();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};

const getPricesRange = async (req, res) => {
  try {
    const prices = await getMinMaxPricesByCategory(req.query.category);
    res.json(prices);
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};

const getSelectedProductsById = async (req, res) => {
  try {
    if (!req.body.productsIds) {
      throw new Error("No ids were provided");
    }
    const products = await getSelectedProductsByIdSQL(req.body.productsIds);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};

const getProductReviews = async (req, res) => {
  try {
    const productId = req.query.id;
    if (!productId) {
      throw new Error("Missing product ID");
    }
    const reviews = await getProductReviewsSQL(productId);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};

const getSpecs = async (req, res) => {
  try {
    const categoryId = req.query.category;
    if (!categoryId) {
      throw new Error("Missing product ID");
    }
    const specsObject = await getSpecsObjSQL(categoryId);
    res.json(specsObject);
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};

module.exports = {
  getProductReviews,
  getPricesRange,
  getProductById,
  getProductImgById,
  getCategories,
  getSelectedProductsById,
  getProducts,
  getSpecs,
};
