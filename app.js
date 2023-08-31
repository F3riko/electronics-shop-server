const dotenv = require("dotenv").config({ path: "./secret.env" });
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var session = require("express-session");

// Cors handling
var cors = require("cors");
var corsOptions = {
  origin: ["http://localhost:3000"],
  methods: ["POST", "GET"],
  credentials: true,
};

var userAuth = require("./routes/Rest API/User API/userAuth");
var userAdd = require("./routes/Rest API/User API/userAdd");
var userInfo = require("./routes/Rest API/User API/userInfo");
var userLogOut = require("./routes/Rest API/User API/userLogOut");
var productsRouter = require("./routes/Rest API/Products API/products");
var userPassResetMsg = require("./routes/Rest API/User API/userPassResetMsg");
var categoriesList = require("./routes/Rest API/Products API/categories");
var productInfo = require("./routes/Rest API/Products API/product");
var userProfile = require("./routes/Rest API/User API/userProfile");
var productImg = require("./routes/Rest API/Products API/productImg");

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

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 5 * 60 * 1000 },
  })
);

// Routes
app.use("/api/products", productsRouter);
app.use("/api/auth/user", userAuth);
app.use("/api/add/user", userAdd);
app.use("/user/info", userInfo);
app.use("/user/logout", userLogOut);
app.use("/api/products/categories", categoriesList);
app.use("/user/passReset", userPassResetMsg);
app.use("/api/products/product", productInfo);
app.use("/user/profile", userProfile);
app.use("/api/products/product/img", productImg);

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
