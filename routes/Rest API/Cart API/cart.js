var express = require("express");
var router = express.Router();
var verifyTokenCart = require("../../../utils/cartMiddleware");
var getCardId = require("../../../db-interactions/api-user/api-get-cart");

router.get("/getCart", verifyTokenCart, async function (req, res, next) {
  //   try {
  const id = await getCardId(req.body.email);
  console.log(id, "id");
  //     if (req.decodedToken) {
  //     } else {
  //     }
  //     res.json({

  //     });
  //   } catch (error) {
  //     res.status(500).json({ error: "An error occurred" });
  //   }
  // });
});

router.get("/add", async function (req, res, next) {
  try {
    if (!req.session.user) {
      if (!req.session.cart) {
        //
      } else {
        //
      }
    } else {
      // Get user cart
    }
    res.json(JSON.stringify(req.session));
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/delete", async function (req, res, next) {
  try {
    if (!req.session.user) {
      if (!req.session.cart) {
        //
      } else {
        //
      }
    } else {
      // Get user cart
    }
    res.json(JSON.stringify(req.session));
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});

module.exports = router;

// req.session.cart = {
//   items: {},
//   itemsQuantity: 0,
//   itemsSelectedQuantity: 0,
// };
// console.log(req.body);
