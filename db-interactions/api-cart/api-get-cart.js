const connection = require("../db-init");

async function getCartId(email) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT c.cart_id
      FROM users u
      LEFT JOIN carts c ON u.id = c.user_id
      WHERE u.email = ?;
    `;

    connection.query(query, [email], (error, results) => {
      if (error) {
        reject(error);
      } else {
        if (results.length > 0) {
          const cartId = results[0].cart_id;
          resolve(cartId);
        } else {
          reject(new Error("Error getting cart"));
        }
      }
    });
  });
}

module.exports = getCartId;
