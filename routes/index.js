var express = require("express");
const AdminRouter = require("./admin");
const ApiRouter = require("./api");
const MainRouter = require("./main");
const GameRouter = require("./game");
var router = express.Router();

/* GET home page. */
router.use("/main", MainRouter);
router.use("/game", GameRouter);
router.use("/admin", AdminRouter);
router.use("/api", ApiRouter);

router.get("/", (req, res) => {
  res.redirect("/main");
});

module.exports = router;
