const connection = require("../db-init");

async function verifyOrderForUser(userEmail, orderId) {
  if (!userEmail || !orderId) {
    throw new Error("Missing data in order verification function");
  }
  const isOrder = await getOrderForEmail(userEmail, orderId);
  return isOrder;
}

function getOrderForEmail(userEmail, orderId) {
  return new Promise((resolve, reject) => {
    const checkOrderQuery = `
        SELECT 1
        FROM users u
        INNER JOIN orders o ON u.id = o.user_id
        WHERE u.email = ? AND o.id = ?
      `;

    connection.query(checkOrderQuery, [userEmail, orderId], (error, result) => {
      if (error) {
        reject(error);
      } else {
        if (result.length === 0) {
          resolve(false);
        } else {
          resolve(true);
        }
      }
    });
  });
}

module.exports = verifyOrderForUser;
