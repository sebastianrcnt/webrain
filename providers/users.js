const { PrismaClient } = require("@prisma/client");
const respondWithError = require("../middlewares/error");
const prisma = new PrismaClient();

const provideAll = () => async (req, res, next) => {
  prisma.user
    .findMany({ where: {} })
    .then((users) => {
      req.context.users = users;
      next();
    })
    .catch(respondWithError(res));
};

const provideOneByEmail = () => async (req, res, next) => {
  prisma.user
    .findOne({ where: { email: req.params.email } })
    .then((user) => {
      if (user) {
        req.context.user = user;
        next();
      } else {
        res.render("utils/message-with-link", {
          message: "존재하지 않거나 삭제된 유저입니다",
          link: "javascript:history.back()",
          linkname: "뒤로가기",
        });
      }
    })
    .catch(respondWithError(res));
};

const UsersProvider = {
  provideAll,
  provideOneByEmail,
};

module.exports = UsersProvider;
