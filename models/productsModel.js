const connection = require("../config/database");
const getAllChildrenCategories = require("../utils/categoryHierarchy");
const util = require("util");
const query = util.promisify(connection.query).bind(connection);

const getProductData = async (id) => {
  try {
    const results = await query("SELECT * FROM items WHERE id = ?", id);

    if (results.length > 0) {
      return results[0];
    } else {
      return null;
    }
  } catch (error) {
    throw error;
  }
};

async function getAllProducts() {
  try {
    const results = await query("SELECT * FROM items");
    return results;
  } catch (error) {
    throw error;
  }
}

const getImgByProductId = async (id) => {
  try {
    const results = await query("SELECT img FROM items WHERE id = ?", id);

    if (results.length > 0) {
      return results[0];
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching img:", error);
    throw error;
  }
};

async function getCategoriesList() {
  try {
    const results = await query("SELECT * FROM categories");
    return results;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
}

async function getProductsByCategory(categoryId) {
  try {
    const allCategories = [
      Number(categoryId),
      ...(await getChildrenCategoriesArray(categoryId)),
    ];

    let queryStr;
    if (allCategories.length === 1) {
      queryStr = "SELECT * FROM items WHERE category_id = ?";
    } else {
      const placeholders = Array(allCategories.length).fill("?").join(", ");
      queryStr = `SELECT * FROM items WHERE category_id IN (${placeholders})`;
    }

    const results = await query(queryStr, allCategories);

    return results;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}

async function getProductsSortedSQL(params) {
  try {
    let queryStr = "SELECT * FROM items WHERE 1=1";
    const { maxPrice, minPrice, sortBy, category } = params;
    if (maxPrice) {
      queryStr += ` AND price <= ${parseFloat(maxPrice)}`;
    }
    if (minPrice) {
      queryStr += ` AND price >= ${parseFloat(minPrice)}`;
    }
    if (category) {
      const categories = await getChildrenCategoriesArray(category);
      categories.push(parseInt(category));
      queryStr += ` AND category_id IN (${categories.join(", ")})`;
    }
    if (sortBy === "rating") {
      queryStr += " ORDER BY item_rating DESC";
    } else if (sortBy === "reviews") {
      queryStr += " ORDER BY reviews_quantity DESC";
    } else if (sortBy === "priceDsc") {
      queryStr += " ORDER BY price DESC";
    } else if (sortBy === "priceAsc") {
      queryStr += " ORDER BY price ASC";
    }

    const result = await query(queryStr);

    return result;
  } catch (error) {
    throw error;
  }
}

async function searchItemsByTitle(searchQuery) {
  try {
    const sanitizedSearchQuery = connection.escape(`%${searchQuery}%`);
    const queryStr = `SELECT * FROM items WHERE title LIKE ${sanitizedSearchQuery}`;
    const result = await query(queryStr);
    return result;
  } catch (error) {
    throw error;
  }
}

const getChildrenCategoriesArray = async (parentId) => {
  const categories = await getCategoriesList();
  const result = getAllChildrenCategories(categories, parentId);
  return result.map((category) => category.id);
};

const getMinMaxPricesByCategory = async (categoryId) => {
  try {
    let queryText =
      "SELECT MIN(price) AS minPrice, MAX(price) AS maxPrice FROM items";
    if (categoryId > 0) {
      const categories = await getChildrenCategoriesArray(categoryId);
      categories.push(categoryId);
      queryText += ` WHERE category_id IN (${categories.join(", ")})`;
    }
    const result = await query(queryText);

    return result[0];
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getMinMaxPricesByCategory,
  searchItemsByTitle,
  getProductsSortedSQL,
  getProductData,
  getAllProducts,
  getImgByProductId,
  getCategoriesList,
  getProductsByCategory,
};