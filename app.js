const dotenv = require("dotenv").config({ path: "./secret.env" });
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const session = require("express-session");
const MemoryStore = require("memorystore")(session);

// Cors handling
const cors = require("cors");
const corsOptions = {
  origin: ["http://localhost:3000"],
  methods: ["POST", "GET", "PUT", "DELETE"],
  credentials: true,
};

const app = express();

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
