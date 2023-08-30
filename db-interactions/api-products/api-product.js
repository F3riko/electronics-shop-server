const connection = require("../db-init");

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

module.exports = getProductData;
