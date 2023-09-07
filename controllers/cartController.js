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

async function getCart(req, res, next) {
  try {
    if (req.decodedToken) {
      const id = await getCartId(req.decodedToken);
      if (id) {
        const contents = await getCartContents(id);
        req.session.cart = contents;
        req.session.cartId = id;
        res.json({ cartId: id, contents: contents });
      } else {
        const newCartId = await createCartForUser(req.body.email);
        req.session.cart = [];
        req.session.cartId = newCartId;
        res.json({ cartId: newCartId, contents: [] });
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
}

async function addCartItem(req, res, next) {
  try {
    if (req.query.id) {
      if (req.session.user && req.session.cart) {
        await increaseCartItem(req.session.cartId, req.query.id);
        res.sendStatus(200);
      } else if (req.session.user && !req.session.cart) {
        const newCartId = await createCartForUser(req.session.user.email);
        await increaseCartItem(newCartId, req.query.id);
        res.sendStatus(200);
      } else if (req.session.cart) {
        const updatedCart = addItemGuestCart(req.query.id, req.session.cart);
        req.session.cart = updatedCart;
        req.session.touch();
        res.json({ contents: req.session.cart });
      } else {
        const updatedCart = addItemGuestCart(req.query.id, []);
        req.session.cart = updatedCart;
        req.session.touch();
        res.json({ contents: req.session.cart });
      }
    } else {
      throw new Error("No product id was provided");
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
}

async function deleteCartItem(req, res, next) {
  try {
    ``;
    if (req.query.id) {
      if (req.decodedToken) {
        if (req.session.cart && req.session.cartId) {
          await decreaseCartItem(req.session.cartId, req.query.id);
          res.sendStatus(200);
        } else if (req.session.user && !req.session.cart) {
          const newCartId = await createCartForUser(req.session.user.email);
          await increaseCartItem(newCartId, req.query.id);
          res.sendStatus(200);
        }
      } else if (req.session.cart) {
        const updatedCart = deleteGuestCartItem(req.query.id, req.session.cart);
        req.session.cart = updatedCart;
        req.session.touch();
        res.json({ contents: req.session.cart });
      } else {
        const updatedCart = deleteGuestCartItem(req.query.id, []);
        req.session.cart = updatedCart;
        req.session.touch();
        res.json({ contents: req.session.cart });
      }
    } else {
      throw new Error("No product id was provided");
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
}

async function getCartPriceWeight(req, res, next) {
  try {
    if (req.session.cart) {
      const { totalSum, totalWeight } = await calcCartInfo(req.session.cart);
      res.json({ info: { totalSum, totalWeight } });
    } else {
      throw new Error("No session cart was provided");
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
}

module.exports = { getCart, addCartItem, deleteCartItem, getCartPriceWeight };
