var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const favicon = require("serve-favicon");
const cors = require("cors");

var indexRouter = require("./routes/index");
const identifyUser = require("./middlewares/user");

var app = express();
// add cors for local environments

app.use(cors());
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(favicon("public/favicon.ico"));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Create Context
app.use((req, res, next) => {
  req.context = {};
  req.user = null;
  req.context.loggedInUser = null;
  next();
});

// Identify User
app.use(identifyUser());

// Route
app.use("/", indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  console.error(err);

  if (err.intended) {
    res.status(401).render("utils/message", {
      message: err.message,
    });
  } else {
    // with debug option?
    res.status(500).render("error", {
      message: "알 수 없는 오류가 발생했습니다.",
      err,
    });
  }
});

module.exports = app;
