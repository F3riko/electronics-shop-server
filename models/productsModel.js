const connection = require("../config/database");
const getAllChildrenCategories = require("../utils/categoryHierarchy");

const getProductData = (id) => {
  return new Promise((resolve, reject) => {
    try {
      connection.query(
        "SELECT * FROM items WHERE id = ?",
        id,
        function (err, results, fields) {
          if (err) {
            console.error("Error fetching products:", err);
            reject(err);
          } else {
            if (results.length > 0) {
              resolve(results[0]);
            } else {
              resolve(null);
            }
          }
        }
      );
    } catch (error) {
      reject(error);
    }
  });
};

async function getAllProducts() {
  try {
    const results = await new Promise((resolve, reject) => {
      connection.query("SELECT * FROM items", function (err, results, fields) {
        if (err) {
          console.error("Error fetching products:", err);
          reject(err);
          return;
        }

        resolve(results);
      });
    });

    return results;
  } catch (error) {
    throw error;
  }
}

const getImgByProductId = (id) => {
  const result = new Promise((resolve, reject) => {
    try {
      connection.query(
        "SELECT img FROM items WHERE id = ?",
        id,
        function (err, results, fields) {
          if (err) {
            console.error("Error fetching img:", err);
            reject(err);
          } else {
            if (results.length > 0) {
              resolve(results[0]);
            } else {
              resolve(null);
            }
          }
        }
      );
    } catch (error) {
      reject(error);
    }
  });
  return result;
};

async function getCategoriesList() {
  try {
    const results = await new Promise((resolve, reject) => {
      connection.query(
        "SELECT * FROM categories",
        function (err, results, fields) {
          if (err) {
            console.error("Error fetching categories:", err);
            reject(err);
            return;
          }

          resolve(results);
        }
      );
    });

    return results;
  } catch (error) {
    throw error;
  }
}

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
