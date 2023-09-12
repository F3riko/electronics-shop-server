const connection = require("../config/database");
const { calcCartInfo } = require("./cartModel");
const util = require("util");
const query = util.promisify(connection.query).bind(connection);

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

async function createOrder(email, totalPrice, totalWeight) {
  try {
    const createOrderQuery = `
      INSERT INTO orders (user_id, order_date, total_price, status, is_paid, total_weight)
      SELECT id, NOW(), ?, 'CR', false, ? FROM users WHERE email = ?
    `;

    const result = await query(createOrderQuery, [
      totalPrice,
      totalWeight,
      email,
    ]);

    return result.insertId;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
}

async function addOrderItems(orderId, orderData) {
  try {
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
      return 0;
    }

    const result = await query(insertItemsQuery, [values]);

    return result.affectedRows;
  } catch (error) {
    throw error;
  }
}

const getOrderWithItems = async (orderId) => {
  try {
    const queryText = `
    SELECT o.id AS order_id, o.order_date, o.total_price, oi.item_id, oi.quantity, oi.item_price, i.title AS item_title
    FROM orders o
    LEFT JOIN orders_items oi ON o.id = oi.order_id
    LEFT JOIN items i ON oi.item_id = i.id
    WHERE o.id = ?
  `;

    const result = await query(queryText, [orderId]);

    if (result.length === 0) {
      throw new Error("Order was not found");
    }

    const orderWithItems = {
      order: {
        order_id: result[0].order_id,
        order_date: result[0].order_date,
        order_total: parseInt(result[0].total_price),
      },
      items: result.map((row) => ({
        item_id: row.item_id,
        quantity: row.quantity,
        price: parseInt(row.item_price),
        title: row.item_title,
      })),
    };

    return orderWithItems;
  } catch (error) {
    throw error;
  }
};

module.exports = { createNewOrder, getOrderWithItems };
