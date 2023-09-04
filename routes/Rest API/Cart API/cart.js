var express = require("express");
var router = express.Router();
var verifyTokenCart = require("../../../utils/cartMiddleware");
var getCardId = require("../../../db-interactions/api-cart/api-get-cart");
const createCartForUser = require("../../../db-interactions/api-cart/api-create-cart");
const getCartContents = require("../../../db-interactions/api-cart/api-get-cart-contents");
const {
  addItemGuestCart,
  deleteGuestCartItem,
} = require("../../../utils/guestCartOp");
const {
  increaseCartItem,
  decreaseCartItem,
} = require("../../../db-interactions/api-cart/api-item-op-cart");

router.get("/getCart", verifyTokenCart, async function (req, res, next) {
  try {
    if (req.decodedToken) {
      const id = await getCardId(req.session.user.email);
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
    console.log(error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/add", async function (req, res, next) {
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
    console.log(error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/delete", verifyTokenCart, async function (req, res, next) {
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
});

module.exports = router;
