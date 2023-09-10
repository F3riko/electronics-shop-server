const connection = require("../config/database");
const util = require("util");
const query = util.promisify(connection.query).bind(connection);

const getCartIdQuery = `
SELECT c.cart_id
FROM users u
LEFT JOIN carts c ON u.id = c.user_id
  WHERE u.email = ?;
  `;
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

async function getCartId(email) {
  try {
    const results = await query(getCartIdQuery, [email]);

    if (results.length > 0) {
      const cartId = results[0].cart_id;
      return cartId;
    } else {
      throw new Error("Error getting cart");
    }
  } catch (error) {
    console.error("Error getting cart:", error);
    throw error;
  }
}

async function getItemInfo(cartId, itemId) {
  try {
    const results = await query(getItemQuantityQuery, [cartId, itemId]);

    if (results.length > 0) {
      return results;
    } else {
      throw new Error("Error getting item info");
    }
  } catch (error) {
    throw error;
  }
}

async function increCartItemQuantity(cartId, itemId) {
  try {
    const results = await query(increaseCartItemQuery, [cartId, itemId]);

    if (results.affectedRows > 0) {
      return results;
    } else {
      throw new Error("Error increasing quantity");
    }
  } catch (error) {
    throw error;
  }
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
  try {
    const results = await query(decreaseCartItemQuery, [cartId, itemId]);

    if (results) {
      return results;
    } else {
      throw new Error("Error decreasing item");
    }
  } catch (error) {
    throw error;
  }
}

async function deleteCartItem(cartId, itemId) {
  try {
    const results = await query(deleteCartItemQuery, [cartId, itemId]);

    if (results) {
      return results;
    } else {
      throw new Error("Error deleting item");
    }
  } catch (error) {
    throw error;
  }
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
  try {
    const results = await query(
      "SELECT * FROM cart_contents WHERE cart_id = ?",
      [cartId]
    );
    return results;
  } catch (error) {
    console.error("Error fetching cart contents:", error);
    throw error;
  }
}

async function calcCartInfo(cartItems) {
  try {
    let totalSum = 0;
    let totalWeight = 0;

    for (const cartItem of cartItems) {
      const { item_id, item_quantity } = cartItem;
      const getItemInfoQuery = `
        SELECT weight, (price - discount) AS discounted_price
        FROM items
        WHERE id = ?;
      `;

      const itemInfo = await query(getItemInfoQuery, [item_id]);

      if (itemInfo.length === 1) {
        const { weight, discounted_price } = itemInfo[0];
        totalSum += discounted_price * item_quantity;
        totalWeight += weight * item_quantity;
      }
    }

    return { totalSum, totalWeight };
  } catch (error) {
    throw error;
  }
}

async function executeQuery(queryStr, params) {
  try {
    const results = await query(queryStr, params);
    return results;
  } catch (error) {
    throw error;
  }
}

async function createCartForUser(email) {
  try {
    const createCartQuery = `
      INSERT INTO carts (user_id, cart_expiration_date)
      SELECT u.id, DATE_ADD(NOW(), INTERVAL 7 DAY)
      FROM users u
      WHERE u.email = ?;
    `;

    const results = await query(createCartQuery, [email]);

    if (results.affectedRows === 1) {
      return results.insertId;
    } else {
      throw new Error("Cart insertion failed");
    }
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getCartId,
  getItemInfo,
  increCartItemQuantity,
  increaseCartItem,
  decreaseCartItem,
  getCartContents,
  calcCartInfo,
  createCartForUser,
};
