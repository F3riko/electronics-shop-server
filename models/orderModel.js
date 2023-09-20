const connection = require("../config/database");
const { calcCartInfo } = require("./cartModel");
const util = require("util");
const query = util.promisify(connection.query).bind(connection);

const createOrderQuery = `
INSERT INTO orders (user_id, order_date, total_price, status, is_paid, total_weight)
SELECT id, NOW(), ?, 'CR', false, ? FROM users WHERE email = ?
`;
const insertItemsQuery = `
INSERT INTO orders_items (order_id, item_id, quantity)
VALUES ?
`;
const orderDataQuery = `
SELECT o.id AS order_id, o.order_date, o.total_price, o.total_weight, oi.item_id, oi.quantity, oi.item_price, i.title AS item_title
FROM orders o
LEFT JOIN orders_items oi ON o.id = oi.order_id
LEFT JOIN items i ON oi.item_id = i.id
WHERE o.id = ?
`;
const getPickupAddressesQuery = "SELECT * FROM pickups";

const createNewOrder = async (orderData, userEmail) => {
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
};

const createOrder = async (email, totalPrice, totalWeight) => {
  try {
    const result = await query(createOrderQuery, [
      totalPrice,
      totalWeight,
      email,
    ]);

    return result.insertId;
  } catch (error) {
    throw error;
  }
};

const addOrderItems = async (orderId, orderData) => {
  try {
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
};

const getOrderWithItems = async (orderId) => {
  try {
    const result = await query(orderDataQuery, [orderId]);

    if (result.length === 0) {
      throw new Error("Order was not found");
    }

    const orderWithItems = {
      order: {
        order_id: result[0].order_id,
        order_date: result[0].order_date,
        order_total: parseInt(result[0].total_price),
        order_weight: parseFloat(result[0].total_weight),
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

const getPickUpAddresses = async () => {
  try {
    const result = await query(getPickupAddressesQuery);

    return result;
  } catch (error) {
    throw error;
  }
};

const processOrderPaymentSQL = async (
  userId,
  orderId,
  paymentId,
  addressId,
  deliveryMethod
) => {
  try {
    let queryText = `
      UPDATE orders
      SET
        is_paid = ${paymentId !== 4 ? 1 : 0},
        status = ${paymentId !== 4 ? "'PAID'" : "'CASH'"},
        payment_method = '${paymentId}',
        delivery_method = '${deliveryMethod}',
        delivery_pickup_address_id = ${addressId}
      WHERE
        id = ${orderId} AND
        user_id = ${userId};
    `;


    const result = await query(queryText);
    const affectedRows = result.affectedRows;
    if (affectedRows === 1) {
      return;
    } else {
      throw new Error("Order payment processing error SQL");
    }
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createNewOrder,
  getOrderWithItems,
  getPickUpAddresses,
  processOrderPaymentSQL,
};
