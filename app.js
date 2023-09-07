const dotenv = require("dotenv").config({ path: "./secret.env" });
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var session = require("express-session");
const MemoryStore = require("memorystore")(session);

// Cors handling
var cors = require("cors");
var corsOptions = {
  origin: ["http://localhost:3000"],
  methods: ["POST", "GET"],
  credentials: true,
};

var app = express();
app.use(cors(corsOptions));

// Middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: new MemoryStore({
      checkPeriod: 86400000,
    }),
    cookie: { maxAge: 10 * 60 * 1000 },
  })
);
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

// New routes import
const productRoutes = require("./routes/api/productRoutes");
const authRoutes = require("./routes/auth/authRoutes");
const cartRoutes = require("./routes/api/cartRoutes");
const orderRoutes = require("./routes/api/orderRoutes");
// New routes declaration
app.use("/products", productRoutes);
app.use("/auth", authRoutes);
app.use("/cart", cartRoutes);
app.use("/order", orderRoutes);

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  // render the error page
  res.status(err.status || 500);
});

module.exports = app;
