const connection = require("../config/database");

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

const increaseCartItemQuery = `
  INSERT INTO cart_contents (cart_id, item_id, item_quantity)
  VALUES (?, ?, 1)
  ON DUPLICATE KEY UPDATE item_quantity = item_quantity + 1;
`;

const getItemQuantityQuery = `
        SELECT i.quantity AS item_quantity, cc.item_quantity AS cart_quantity
        FROM items AS i
        LEFT JOIN cart_contents AS cc ON i.id = cc.item_id AND cc.cart_id = ?
        WHERE i.id = ?;
      `;

const decreaseCartItemQuery = `
  UPDATE cart_contents
  SET item_quantity = item_quantity - 1
  WHERE cart_id = ? AND item_id = ? AND item_quantity > 1;
`;

const deleteCartItemQuery = `
  DELETE FROM cart_contents
  WHERE cart_id = ? AND item_id = ?;
`;

async function getItemInfo(cartId, itemId) {
  return new Promise((resolve, reject) => {
    connection.query(
      getItemQuantityQuery,
      [cartId, itemId],
      (error, results) => {
        if (error) {
          reject(error);
        } else {
          if (results.length > 0) {
            resolve(results);
          } else {
            reject(new Error("Error getting item info"));
          }
        }
      }
    );
  });
}

async function increCartItemQuantity(cartId, itemId) {
  return new Promise((resolve, reject) => {
    connection.query(
      increaseCartItemQuery,
      [cartId, itemId],
      (error, results) => {
        if (error) {
          reject(error);
        } else {
          if (results.affectedRows > 0) {
            resolve(results);
          } else {
            reject(new Error("Error increasing quantity"));
          }
        }
      }
    );
  });
}

async function increaseCartItem(cartId, itemId) {
  try {
    const [itemInfo] = await getItemInfo(cartId, itemId);
    if (!itemInfo || itemInfo.item_quantity === 0) {
      throw new Error("Item not found in the items table or quantity is 0.");
    }

    const itemQuantityInItemsTable = itemInfo.item_quantity;
    const currentQuantityInCart = itemInfo.cart_quantity || 0;

    if (currentQuantityInCart < itemQuantityInItemsTable) {
      const results = await increCartItemQuantity(cartId, itemId);
      return { msg: "Item quantity increased in the cart.", results: results };
    } else {
      throw new Error(
        "Item quantity in cart cannot exceed the available quantity."
      );
    }
  } catch (error) {
    throw error;
  }
}

async function decreaseCartItemSQL(cartId, itemId) {
  return new Promise((resolve, reject) => {
    connection.query(
      decreaseCartItemQuery,
      [cartId, itemId],
      (error, results) => {
        if (error) {
          reject(error);
        } else {
          if (results) {
            resolve(results);
          } else {
            reject(new Error("Error decreasing item"));
          }
        }
      }
    );
  });
}

async function deleteCartItem(cartId, itemId) {
  return new Promise((resolve, reject) => {
    connection.query(
      deleteCartItemQuery,
      [cartId, itemId],
      (error, results) => {
        if (error) {
          reject(error);
        } else {
          if (results) {
            resolve(results);
          } else {
            reject(new Error("Error deleting item"));
          }
        }
      }
    );
  });
}

async function decreaseCartItem(cartId, itemId) {
  try {
    const resultsDecr = await decreaseCartItemSQL(cartId, itemId);
    if (resultsDecr.affectedRows === 0) {
      const results = await deleteCartItem(cartId, itemId);
      return { msg: "Item removed from the cart.", results };
    } else {
      return "Item quantity decreased in the cart.";
    }
  } catch (error) {
    throw error;
  }
}

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

async function createCartForUser(email) {
  return new Promise((resolve, reject) => {
    const createCartQuery = `
        INSERT INTO carts (user_id, cart_expiration_date)
        SELECT u.id, DATE_ADD(NOW(), INTERVAL 7 DAY)
        FROM users u
        WHERE u.email = ?;
      `;

    connection.query(createCartQuery, [email], (error, results) => {
      if (error) {
        reject(error);
      } else {
        if (results.affectedRows === 1) {
          console.log(results.insertId);
          resolve(results.insertId);
        } else {
          reject(new Error("Cart insertion failed"));
        }
      }
    });
  });
}

module.exports = { getCartId, getItemInfo, increCartItemQuantity, increaseCartItem, decreaseCartItem, getCartContents, calcCartInfo, createCartForUser};
