const connection = require("../db-init");

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

module.exports = { getAllProducts, getCategoriesList };
