const {
  getProductData,
  getAllProducts,
  getImgByProductId,
  getCategoriesList,
  getProductsByCategory,
  getProductsSortedSQL,
  searchItemsByTitle,
  getMinMaxPricesByCategory,
  getSelectedProductsByIdSQL,
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

async function getProductsSorted(req, res, next) {
  try {
    const products = await getProductsSortedSQL(req.query);
    res.json(products);
  } catch (error) {
    throw error;
  }
}

async function getPricesRange(req, res, next) {
  try {
    const prices = await getMinMaxPricesByCategory(req.query.category);
    res.json(prices);
  } catch (error) {
    throw error;
  }
}

async function searchProductsByQuery(req, res, next) {
  try {
    if (!req.query.searchQuery) {
      throw new Error("No search query");
    }
    const products = await searchItemsByTitle(req.query.searchQuery);
    res.json(products);
  } catch (error) {
    throw error;
  }
}

async function getSelectedProductsById(req, res, next) {
  try {
    if (!req.body.productsIds) {
      throw new Error("No ids were provided");
    }
    const products = await getSelectedProductsByIdSQL(req.body.productsIds);
    res.json(products);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
}

module.exports = {
  getPricesRange,
  getProductsSorted,
  getProductById,
  getAllProductsController,
  getProductImgById,
  getCategories,
  getProductByCategoryController,
  searchProductsByQuery,
  getSelectedProductsById,
};
