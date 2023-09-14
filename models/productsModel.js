const connection = require("../config/database");
const getAllChildrenCategories = require("../utils/categoryHierarchy");
const util = require("util");
const query = util.promisify(connection.query).bind(connection);
const NodeCache = require("node-cache");
const cache = new NodeCache();

const getCategoriesQuery = "SELECT * FROM categories";
const getMinMaxPricesByCategoryQueryQuery =
  "SELECT * FROM items WHERE id IN (?)";

(async () => {
  const categories = await query(getCategoriesQuery);
  cache.set("categories", categories, 3600);
})();

const getProductData = async (id) => {
  try {
    const results = await query("SELECT * FROM items WHERE id = ?", id);

    if (results.length > 0) {
      return results[0];
    } else {
      throw new Error("No resulst were retrieved");
    }
  } catch (error) {
    throw error;
  }
};

const getImgByProductId = async (id) => {
  try {
    const results = await query("SELECT img FROM items WHERE id = ?", id);

    if (results.length > 0) {
      return results[0];
    } else {
      throw new Error("No resulst were retrieved");
    }
  } catch (error) {
    throw error;
  }
};

const getCategoriesList = async () => {
  try {
    const categories = cache.get("categories");
    if (categories) {
      return categories;
    } else {
      const results = await query(getCategoriesQuery);
      cache.set("categories", results, 3600);
      return results;
    }
  } catch (error) {
    throw error;
  }
};

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

const getSelectedProductsByIdSQL = async (productIds) => {
  try {
    const result = await query(getMinMaxPricesByCategoryQueryQuery, [
      JSON.parse(productIds),
    ]);
    return result;
  } catch (error) {
    throw error;
  }
};

const getProductsSQL = async (params) => {
  try {
    let queryStr = "SELECT * FROM items WHERE 1=1";
    const { maxPrice, minPrice, sortBy, category, searchQuery } = params;
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
    if (searchQuery) {
      const sanitizedSearchQuery = connection.escape(`%${searchQuery}%`);
      queryStr += ` AND title LIKE ${sanitizedSearchQuery}`;
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
};

module.exports = {
  getSelectedProductsByIdSQL,
  getMinMaxPricesByCategory,
  getProductData,
  getImgByProductId,
  getCategoriesList,
  getProductsSQL,
};
