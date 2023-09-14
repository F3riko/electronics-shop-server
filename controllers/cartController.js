const {
  increaseCartItem,
  decreaseCartItem,
  getCartContents,
  calcCartInfo,
  createCartForUser,
  getCartId,
} = require("../models/cartModel");
const {
  addItemGuestCart,
  deleteGuestCartItem,
} = require("../utils/cart/guestCartOperations");

const getCart = async (req, res) => {
  try {
    const userEmail = req.decodedToken;
    if (userEmail) {
      let cartId = req.session.cartId;
      if (cartId) {
        const contents = await getCartContents(cartId);
        res.json({ contents: contents });
      } else {
        cartId = await getCartId(userEmail);
        if (cartId) {
          const contents = await getCartContents(cartId);
          req.session.cartId = cartId;
          res.json({ contents: contents });
        } else {
          cartId = await createCartForUser(userEmail);
          req.session.cartId = cartId;
          res.json({ contents: [] });
        }
      }
    } else if (req.session.cart) {
      res.json({ contents: req.session.cart });
    } else {
      req.session.cart = [];
      res.json({ contents: [] });
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};

const addCartItem = async (req, res) => {
  try {
    const productId = req.query.id;
    if (!productId) {
      throw new Error("No product id was provided");
    }
    const userEmail = req.decodedToken;
    if (userEmail) {
      let cartId = req.session.cartId;
      if (cartId) {
        await increaseCartItem(cartId, productId);
        res.sendStatus(200);
      } else {
        cartId = await getCartId(userEmail);
        if (cartId) {
          await increaseCartItem(cartId, productId);
          req.session.cartId = cartId;
          res.sendStatus(200);
        } else {
          cartId = await createCartForUser(userEmail);
          await increaseCartItem(cartId, productId);
          req.session.cartId = cartId;
          res.sendStatus(200);
        }
      }
    } else {
      req.session.touch();
      const cart = req.session.cart;
      if (cart) {
        const updatedCart = addItemGuestCart(productId, cart);
        req.session.cart = updatedCart;
        res.json({ contents: updatedCart });
      } else {
        const updatedCart = addItemGuestCart(productId, []);
        req.session.cart = updatedCart;
        res.json({ contents: updatedCart });
      }
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};

const deleteCartItem = async (req, res) => {
  try {
    const productId = req.query.id;
    if (!productId) {
      throw new Error("No product id was provided");
    }
    const userEmail = req.decodedToken;
    if (userEmail) {
      let cartId = req.session.cartId;
      if (cartId) {
        await decreaseCartItem(cartId, productId);
        res.sendStatus(200);
      } else {
        cartId = await getCartId(userEmail);
        if (cartId) {
          await decreaseCartItem(cartId, productId);
          req.session.cartId = cartId;
          res.sendStatus(200);
        } else {
          cartId = await createCartForUser(userEmail);
          req.session.cartId = cartId;
          res.sendStatus(400);
        }
      }
    } else {
      req.session.touch();
      const cart = req.session.cart;
      if (cart) {
        const updatedCart = deleteGuestCartItem(productId, cart);
        req.session.cart = updatedCart;
        res.json({ contents: updatedCart });
      } else {
        req.session.cart = [];
        res.sendStatus(400);
      }
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};

const getCartPriceWeight = async (req, res) => {
  try {
    const userEmail = req.decodedToken;
    if (userEmail) {
      let cartId = req.session.cartId;
      if (cartId) {
        const cart = await getCartContents(cartId);
        const { totalSum, totalWeight } = await calcCartInfo(cart);
        res.json({ info: { totalSum, totalWeight } });
      } else {
        cartId = getCartId(userEmail);
        if (!cartId) {
          cartId = createCartForUser(userEmail);
          req.session.cartId = cartId;
          res.json({ info: { totalSum: 0, totalWeight: 0 } });
        }
      }
    } else {
      const cart = req.session.cart;
      if (!cart) {
        req.session.cart = [];
        res.json({ info: { totalSum: 0, totalWeight: 0 } });
      } else {
        const { totalSum, totalWeight } = await calcCartInfo(cart);
        res.json({ info: { totalSum, totalWeight } });
      }
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};

module.exports = { getCart, addCartItem, deleteCartItem, getCartPriceWeight };
