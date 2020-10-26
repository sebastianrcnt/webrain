const fs = require("fs");
const HomeProvider = (req, res, next) => {
  req.context = {
    ...req.context,
    html: fs.readFileSync("html/home.html", { encoding: "utf8" }),
  };
  next();
};

module.exports = HomeProvider;
