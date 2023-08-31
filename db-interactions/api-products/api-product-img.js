const connection = require("../db-init");

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

module.exports = getImgByProductId;
