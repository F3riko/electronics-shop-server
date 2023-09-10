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

const getChildrenCategoriesArray = async (parentId) => {
  const categories = await getCategoriesList();
  const result = getAllChildrenCategories(categories, parentId);
  return result.map((category) => category.id);
};

module.exports = {
  getProductData,
  getAllProducts,
  getImgByProductId,
  getCategoriesList,
  getProductsByCategory,
};
