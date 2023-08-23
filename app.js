var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

// Cors handling
var cors = require("cors");
var corsOptions = {
  origin: ["http://localhost:3000"],
  methods: ["POST", "GET"],
  credentials: true,
};

var productsRouter = require("./routes/Rest API/Products API/products");
var userAuth = require("./routes/Rest API/User API/userAuth");
var userAdd = require("./routes/Rest API/User API/userAdd");
var categoriesList = require("./routes/Rest API/Products API/categories");
var userPassResetMsg = require("./routes/Rest API/User API/userPassResetMsg");
var userInfo = require("./routes/Rest API/User API/userInfo");

var app = express();
app.use(cors(corsOptions));

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Middleware
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

// Routes
app.use("/api/products", productsRouter);
app.use("/api/auth/user", userAuth);
app.use("/api/add/user", userAdd);
app.use("/api/products/categories", categoriesList);
app.use("/user/passReset", userPassResetMsg);
app.use("/user/info", userInfo);

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
  res.render("error");
});

module.exports = app;
