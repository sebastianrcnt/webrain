const { PrismaClient } = require("@prisma/client");

const respondWithError = require("../middlewares/error");
const prisma = new PrismaClient();

const provideAll = () => async (req, res, next) => {
  prisma.experiment
    .findMany({ where: {}, include: { User: true } })
    .then((experiments) => {
      req.context.experiments = experiments;
      next();
    })
    .catch(respondWithError(res));
};

const provideOneById = () => async (req, res, next) => {
  prisma.experiment
    .findOne({
      where: { id: req.params.id },
    })
    .then((experiment) => {
      if (experiment) {
        req.context.experiment = experiment;
        next();
      } else {
        res.render("utils/message", {
          message: "존재하지 않거나 삭제된 실험입니다.",
          link: "javascript:history.back()",
          linkname: "뒤로가기",
        });
      }
    })
    .catch(respondWithError(res));
};

const ExperimentsProvider = { provideAll, provideOneById };

module.exports = ExperimentsProvider;
