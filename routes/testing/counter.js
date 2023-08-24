var express = require("express");
var router = express.Router();
var session = require("express-session");

router.use(
  session({
    secret: "dsafl;jasd",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 5 * 60 * 1000 },
  })
);

router.post("/increment", (req, res) => {
  if (!req.session.counter) {
    req.session.counter = 0;
  }
  req.session.counter++;
  res.json({ counter: req.session.counter });
});

router.post("/decrement", (req, res) => {
  if (!req.session.counter) {
    req.session.counter = 0;
  }
  req.session.counter--;
  res.json({ counter: req.session.counter });
});

module.exports = router;
