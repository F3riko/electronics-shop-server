const connection = require("../config/database");
const { calcCartInfo } = require("./cartModel");

async function createNewOrder(orderData, userEmail) {
  // Getting total price and total weight of the items
  const { totalSum, totalWeight } = await calcCartInfo(
    Object.values(orderData)
  );
  if (!totalSum || !totalWeight) {
    throw new Error("Calculating total price and weight: error");
  }
  // Creating new ordeor
  const orderId = await createOrder(userEmail, totalSum, totalWeight);
  if (!orderId) {
    throw new Error("Order creation: error");
  }
  // Add items to the order and alter quantity in the items table
  const rows = await addOrderItems(orderId, orderData);
  if (!rows) {
    throw new Error("Filling order items: error");
  }
  return orderId;
}

function createOrder(email, totalPrice, totalWeight) {
  return new Promise((resolve, reject) => {
    const createOrderQuery = `
      INSERT INTO orders (user_id, order_date, total_price, status, is_paid, total_weight)
      SELECT id, NOW(), ?, 'CR', false, ? FROM users WHERE email = ?
    `;

    connection.query(
      createOrderQuery,
      [totalPrice, totalWeight, email],
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.insertId);
        }
      }
    );
  });
}

function addOrderItems(orderId, orderData) {
  return new Promise((resolve, reject) => {
    const insertItemsQuery = `
      INSERT INTO orders_items (order_id, item_id, quantity)
      VALUES ?
    `;
    const values = [];

    for (const key in orderData) {
      if (orderData.hasOwnProperty(key)) {
        const item = orderData[key];
        values.push([orderId, item.item_id, item.item_quantity]);
      }
    }

    if (values.length === 0) {
      resolve(0);
      return;
    }

    connection.query(insertItemsQuery, [values], (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result.affectedRows);
      }
    });
  });
}

module.exports = createNewOrder;
