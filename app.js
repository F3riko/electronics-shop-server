var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var productsRouter = require("./routes/Rest API/Products API/products");
var userAuth = require("./routes/Rest API/User API/userAuth");
var userAdd = require("./routes/Rest API/User API/userAdd");
var categoriesList = require("./routes/Rest API/Products API/categories");

var app = express();
var cors = require("cors");

app.use(cors());

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// routes declaration
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/api/products", productsRouter);
app.use("/api/auth/user", userAuth);
app.use("/api/add/user", userAdd);
app.use("/api/products/categories", categoriesList);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
