const connection = require("../db-init");

async function calcCartInfo(cartItems) {
  return new Promise(async (resolve, reject) => {
    let totalSum = 0;
    let totalWeight = 0;

    for (const cartItem of cartItems) {
      const { item_id, item_quantity } = cartItem;
      const getItemInfoQuery = `
        SELECT weight, (price - discount) AS discounted_price
        FROM items
        WHERE id = ?;
      `;

      try {
        const itemInfo = await executeQuery(getItemInfoQuery, [item_id]);
        if (itemInfo.length === 1) {
          const { weight, discounted_price } = itemInfo[0];
          totalSum += discounted_price * item_quantity;
          totalWeight += weight * item_quantity;
        }
      } catch (error) {
        reject(error);
      }
    }

    resolve({ totalSum, totalWeight });
  });
}

async function executeQuery(query, params) {
  return new Promise((resolve, reject) => {
    connection.query(query, params, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

module.exports = calcCartInfo;
