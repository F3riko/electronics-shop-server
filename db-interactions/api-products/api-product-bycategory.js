const getChildrenCategoriesArray = require("../../utils/categoryHierarchy");
const connection = require("../db-init");

async function getProductsByCategory(categoryId) {
  try {
    const allCategories = [
      Number(categoryId),
      ...(await getChildrenCategoriesArray(categoryId)),
    ];
    let query;
    if (allCategories.length === 1) {
      query = "SELECT * FROM items WHERE category_id = ?";
    } else {
      const placeholders = Array(allCategories.length).fill("?").join(", ");
      query = `SELECT * FROM items WHERE category_id IN (${placeholders})`;
    }
    const results = await new Promise((resolve, reject) => {
      connection.query(query, allCategories, function (err, results, fields) {
        if (err) {
          console.error("Error fetching products:", err);
          reject(err);
        } else {
          resolve(results);
        }
      });
    });

    return results;
  } catch (error) {
    throw error;
  }
}

module.exports = getProductsByCategory;
