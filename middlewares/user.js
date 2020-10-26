const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");

const identifyUser = () => (req, res, next) => {
  const token =
    req.query["webrain-token"] ||
    req.query.token ||
    req.cookies["webrain-token"];
  if (token) {
    try {
      const payload = jwt.verify(token, "secret");
      if (payload.email) {
        prisma.user
          .findOne({ where: { email: payload.email } })
          .then((found) => {
            if (found) {
              req.user = found;
              req.context.loggedInUser = found;
              next();
            } else {
              next();
            }
          });
      } else {
        next();
      }
    } catch (e) {
      console.error(e);
      next();
    }
  } else {
    next();
  }
};

module.exports = identifyUser;
