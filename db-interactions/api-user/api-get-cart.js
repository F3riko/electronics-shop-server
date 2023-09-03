const connection = require("../db-init");

async function getCartId(email) {
  try {
    const query = `
      SELECT c.cart_id
      FROM users u
      LEFT JOIN carts c ON u.id = c.user_id
      WHERE u.email = ?;
    `;

    const result = await connection.execute(query, [email]);
    const cartId = result.length > 0 ? result[0].cart_id : null;
    return cartId;
  } catch (error) {
    throw error;
  }
}

module.exports = getCartId;
