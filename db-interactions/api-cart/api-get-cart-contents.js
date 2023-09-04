const connection = require("../db-init");

async function getCartContents(cartId) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT *
      FROM cart_contents
      WHERE cart_id = ?;
    `;

    connection.query(query, [cartId], (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

module.exports = getCartContents;
